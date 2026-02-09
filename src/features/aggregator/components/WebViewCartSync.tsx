import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, spacing, fontSize, fontWeight } from '../../../theme';
import { useCartStore, CartItem, Platform } from '../../../store';
import { X } from 'lucide-react-native';

interface WebViewCartSyncProps {
  platform: 'amazon' | 'flipkart' | 'myntra';
  onClose: () => void;
}

const PLATFORM_URLS = {
  amazon: 'https://www.amazon.in/gp/cart/view.html',
  flipkart: 'https://www.flipkart.com/viewcart',
  myntra: 'https://www.myntra.com/checkout/cart',
};

// JavaScript to inject into the WebView to extract cart data
const INJECTION_SCRIPTS = {
  amazon: `
    (function() {
      const send = (payload) => {
        if (
          window.ReactNativeWebView &&
          typeof window.ReactNativeWebView.postMessage === 'function'
        ) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      };

      try {
        const items = [];
        const seenItems = new Set();
        const debugLogs = ['Amazon extractor started'];

        const getCurrencyValues = (value) =>
          Array.from((value || '').matchAll(/(?:₹|Rs\\.?|INR|\\$)\\s*([0-9][0-9,]*)/gi))
            .map((match) => parseFloat((match[1] || '').replace(/,/g, '')))
            .filter((num) => Number.isFinite(num) && num > 0 && num <= 500000);

        const parsePriceFromText = (value) => {
          const currency = getCurrencyValues(value);
          if (currency.length > 0) return currency[0];
          const fallback = (value || '').match(/\\b([1-9][0-9,]{2,})\\b/);
          if (!fallback) return 0;
          const parsed = parseFloat((fallback[1] || '').replace(/,/g, ''));
          return Number.isFinite(parsed) && parsed <= 500000 ? parsed : 0;
        };

        const getImageUrl = (item) => {
          if (!item) return '';
          const normalize = (value) => {
            const url = (value || '').trim();
            if (!url) return '';
            const normalized = url.startsWith('//') ? 'https:' + url : url;
            const lower = normalized.toLowerCase();
            const isPlaceholder =
              lower.startsWith('data:image/gif') ||
              lower.includes('transparent-pixel') ||
              lower.includes('loadingspinner') ||
              lower.includes('/loading/') ||
              lower.includes('/spinner/');
            return isPlaceholder ? '' : normalized;
          };

          const extractDynamicImageUrls = (rawValue) => {
            const urls = [];
            const raw = (rawValue || '').trim();
            if (!raw) return urls;

            // Try JSON first.
            try {
              const parsed = JSON.parse(raw);
              Object.keys(parsed || {}).forEach((key) => {
                const candidate = normalize(key);
                if (candidate) urls.push(candidate);
              });
            } catch (e) {
              // Fallback: amazon sometimes stores HTML-escaped JSON.
              const decoded = raw.replace(/&quot;/g, '"');
              try {
                const parsedDecoded = JSON.parse(decoded);
                Object.keys(parsedDecoded || {}).forEach((key) => {
                  const candidate = normalize(key);
                  if (candidate) urls.push(candidate);
                });
              } catch (e2) {}
            }
            return urls;
          };

          const imageNodes = Array.from(
            item.querySelectorAll('img.sc-product-image, img[data-old-hires], img[data-a-dynamic-image], img')
          );

          const candidateUrls = [];
          imageNodes.forEach((img) => {
            const oldHiRes = normalize(img.getAttribute('data-old-hires') || '');
            if (oldHiRes) candidateUrls.push(oldHiRes);

            extractDynamicImageUrls(img.getAttribute('data-a-dynamic-image') || '').forEach((url) =>
              candidateUrls.push(url)
            );

            const srcSet = img.getAttribute('srcset') || '';
            if (srcSet) {
              srcSet
                .split(',')
                .map((part) => part.trim().split(' ')[0])
                .filter(Boolean)
                .forEach((url) => {
                  const candidate = normalize(url);
                  if (candidate) candidateUrls.push(candidate);
                });
            }

            const src = normalize(img.getAttribute('src') || img.getAttribute('data-src') || '');
            if (src) candidateUrls.push(src);
          });

          // Sometimes dynamic image JSON lives on wrappers.
          Array.from(item.querySelectorAll('[data-a-dynamic-image]')).forEach((node) => {
            extractDynamicImageUrls(node.getAttribute('data-a-dynamic-image') || '').forEach((url) =>
              candidateUrls.push(url)
            );
          });

          const uniqueCandidates = Array.from(new Set(candidateUrls));
          if (uniqueCandidates.length === 0) return '';

          const scoreUrl = (url) => {
            let score = 0;
            const lower = url.toLowerCase();
            if (lower.includes('/images/i/')) score += 50;
            if (lower.includes('images-na.ssl-images-amazon.com')) score += 40;
            if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.webp')) score += 20;
            if (lower.includes('_ac_') || lower.includes('_sl')) score += 10;

            // Prefer higher resolution variants when size markers exist.
            const sizeMatches = Array.from(url.matchAll(/_(sx|sy|ux|uy)(\\d{2,4})_/gi));
            if (sizeMatches.length > 0) {
              const maxSize = Math.max(...sizeMatches.map((m) => parseInt(m[2], 10)).filter((n) => Number.isFinite(n)));
              score += maxSize / 10;
            } else {
              score += Math.min(url.length, 120) / 10;
            }

            return score;
          };

          uniqueCandidates.sort((a, b) => scoreUrl(b) - scoreUrl(a));
          return uniqueCandidates[0] || '';
        };

        const activeRoot =
          document.querySelector('#sc-active-cart') ||
          document.querySelector('#activeCartViewForm') ||
          document.querySelector('[id*="activeCart"]') ||
          document;

        const isLikelyCartItem = (el) => {
          const text = (el?.innerText || el?.textContent || '').trim();
          if (!text || text.length < 25 || text.length > 12000) return false;
          if (!el.querySelector('img')) return false;
          if (!/(Delete|Remove|Qty|Quantity|Save for later)/i.test(text)) return false;
          if (/(Buy it again|Recommended|Frequently bought|Customers who bought|Sponsored)/i.test(text)) {
            return false;
          }
          if (el.closest('#sc-saved-cart, [id*="saved"], [class*="saved"]')) return false;
          return true;
        };

        let cartItems = [];
        const selectors = ['.sc-list-item', '.sc-mobile-cart-list-item', '[id^="sc-item-"]', 'div[data-asin]'];
        for (const selector of selectors) {
          const found = Array.from(activeRoot.querySelectorAll(selector)).filter(isLikelyCartItem);
          if (found.length > 0) {
            cartItems = found;
            break;
          }
        }

        if (cartItems.length === 0) {
          cartItems = Array.from(activeRoot.querySelectorAll('div')).filter(isLikelyCartItem);
        }

        const uniqueItems = Array.from(new Set(cartItems)).filter(
          (item, _, all) => !all.some((other) => other !== item && item.contains(other))
        );
        debugLogs.push('Cart item containers: ' + uniqueItems.length);

        const isSelectedItem = (item) => {
          const cls = ((item.className || '') + ' ' + (item.getAttribute('data-state') || '')).toLowerCase();
          if (/deselect|unselect/.test(cls)) return false;

          const selector =
            '.sc-item-checkbox input[type="checkbox"], input[type="checkbox"][name*="select"], input[type="checkbox"][id*="select"], input[type="checkbox"][aria-label*="Select"]';
          const checkbox = item.querySelector(selector);
          if (!checkbox) return true;
          return !!checkbox.checked;
        };

        uniqueItems.forEach((item, index) => {
          if (!isSelectedItem(item)) return;

          const titleSelectors = [
            '.sc-product-title',
            '.sc-grid-item-product-title',
            '[data-name="Active Items"] a[title]',
            'a.a-link-normal[title]',
            'h2',
          ];

          let title = '';
          for (const selector of titleSelectors) {
            const node = item.querySelector(selector);
            const candidate = (node?.getAttribute?.('title') || node?.textContent || '').replace(/\\s+/g, ' ').trim();
            if (
              candidate &&
              candidate.length > 3 &&
              !/(Delete|Remove|Save for later|Qty|Quantity|Sponsored)/i.test(candidate)
            ) {
              title = candidate;
              break;
            }
          }

          if (!title) return;

          const priceSelectors = [
            '.sc-price .a-offscreen',
            '.a-price .a-offscreen',
            '.sc-price',
            '[class*="price"] .a-offscreen',
          ];

          let price = 0;
          for (const selector of priceSelectors) {
            const nodes = Array.from(item.querySelectorAll(selector));
            for (const node of nodes) {
              const parsed = parsePriceFromText(node.textContent || '');
              if (parsed > 0) {
                price = parsed;
                break;
              }
            }
            if (price > 0) break;
          }

          if (!price) {
            const values = getCurrencyValues((item.innerText || item.textContent || '')).slice(0, 2);
            if (values.length > 0) price = Math.min(...values);
          }

          let quantity = 1;
          const qtySelect = item.querySelector('select[name*="quantity"], [name^="quantity"]');
          if (qtySelect && qtySelect.value) {
            const parsedQty = parseInt(qtySelect.value, 10);
            if (Number.isFinite(parsedQty) && parsedQty > 0) quantity = parsedQty;
          } else {
            const qtyText = item.querySelector('.a-dropdown-prompt, [class*="quantity"]')?.innerText || '';
            const qtyMatch = qtyText.match(/(\\d+)/);
            if (qtyMatch) quantity = parseInt(qtyMatch[1], 10);
          }

          const imageUrl = getImageUrl(item);

          if (price > 0) {
            const dedupeKey = [title.toLowerCase(), String(price), imageUrl || ('no-image-' + index)].join('|');
            if (seenItems.has(dedupeKey)) return;
            seenItems.add(dedupeKey);

            items.push({
              id: 'amz-' + Date.now() + '-' + index,
              platform: 'amazon',
              title: title.substring(0, 80),
              price: price,
              quantity: quantity,
              imageUrl: imageUrl,
              url: window.location.href,
              addedAt: new Date().toISOString()
            });
          }
        });

        debugLogs.push('Selected cart items extracted: ' + items.length);
        send({ success: true, items: items, debug: { logs: debugLogs } });
      } catch (error) {
        send({
          success: false,
          error: (error && error.message) ? error.message : 'Amazon extraction failed'
        });
      }
    })();
  `,

  flipkart: `
    (function() {
      const send = (payload) => {
        if (
          window.ReactNativeWebView &&
          typeof window.ReactNativeWebView.postMessage === 'function'
        ) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      };

      try {
        const items = [];
        const seenItems = new Set();
        const debugLogs = ['Flipkart extractor started'];

        const getCurrencyValues = (value) =>
          Array.from((value || '').matchAll(/(?:₹|Rs\\.?|INR)\\s*([0-9][0-9,]*)/gi))
            .map((match) => parseFloat((match[1] || '').replace(/,/g, '')))
            .filter((num) => Number.isFinite(num) && num > 0 && num <= 500000);

        const getNumericValues = (value) =>
          Array.from((value || '').matchAll(/\\b([1-9][0-9,]{2,})\\b/g))
            .map((match) => parseFloat((match[1] || '').replace(/,/g, '')))
            .filter((num) => Number.isFinite(num) && num > 0 && num <= 500000);

        const parsePriceFromText = (value) => {
          const currency = getCurrencyValues(value);
          if (currency.length > 0) return currency[0];
          const numeric = getNumericValues(value);
          return numeric.length > 0 ? numeric[0] : 0;
        };

        const getImageUrl = (img) => {
          if (!img) return '';
          const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
          if (src) return src.startsWith('//') ? 'https:' + src : src;
          const srcSet = img.getAttribute('srcset') || '';
          if (!srcSet) return '';
          const first = srcSet.split(',')[0]?.trim().split(' ')[0] || '';
          return first.startsWith('//') ? 'https:' + first : first;
        };

        const resolveContainer = (seed) => {
          let node = seed;
          for (let depth = 0; depth < 10 && node; depth += 1) {
            const text = (node.innerText || node.textContent || '').trim();
            const hasImage = !!node.querySelector('img');
            const hasPriceSignal =
              getCurrencyValues(text).length > 0 ||
              !!node.querySelector(
                '._30jeq3, ._1_WHN1, [class*="price"], [class*="Price"], [class*="amount"], [class*="sellingPrice"]'
              );
            const hasAction = /(Remove|Save for later|Qty\\s*:|Qty\\s)/i.test(text);
            if (hasImage && hasPriceSignal && hasAction && text.length < 5000) {
              return node;
            }
            node = node.parentElement;
          }
          return null;
        };

        const seedNodes = [
          ...Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/product/"]')),
          ...Array.from(document.querySelectorAll('button, span, div')).filter(
            (el) => /Remove/i.test((el.textContent || '').trim()) && (el.offsetWidth > 0 || el.offsetHeight > 0)
          ),
          ...Array.from(document.querySelectorAll('div[data-id]')),
        ];

        const containers = [];
        seedNodes.forEach((seed) => {
          const container = resolveContainer(seed);
          if (container) containers.push(container);
        });

        // Fallback for DOM variants where explicit seed nodes are sparse.
        if (containers.length === 0) {
          const fallback = Array.from(document.querySelectorAll('div')).filter((el) => {
            const text = (el.innerText || el.textContent || '').trim();
            if (!text || text.length < 40) return false;
            const hasImage = !!el.querySelector('img');
            const hasPrice = getCurrencyValues(text).length > 0;
            const hasAction = /(Remove|Save for later|Qty\\s*:|Qty\\s)/i.test(text);
            return hasImage && hasPrice && hasAction && text.length < 5000;
          });
          containers.push(...fallback);
        }

        const uniqueContainers = Array.from(new Set(containers)).filter(
          (container, _, all) => !all.some((other) => other !== container && container.contains(other))
        );
        debugLogs.push('Containers identified: ' + uniqueContainers.length);

        uniqueContainers.forEach((container, index) => {
          const text = (container.innerText || container.textContent || '').trim();
          if (!text) return;

          const imageEl = container.querySelector('img');
          const imageUrl = getImageUrl(imageEl);
          const imageAlt = (imageEl?.getAttribute('alt') || '').trim();

          const isValidTitle = (value) => {
            const titleText = (value || '').trim();
            if (!titleText || titleText.length < 8) return false;
            if (!/[A-Za-z]/.test(titleText)) return false;
            if (/^(Hot Deal|Sponsored|Assured)$/i.test(titleText)) return false;
            if (
              /(Save for later|Remove|Buy this now|Qty\\s*:|Delivery by|Sold by|WOW|Buy at|Or Pay|\\bOFF\\b|₹)/i.test(
                titleText
              )
            ) {
              return false;
            }
            if (/^\\d+(\\.\\d+)?\\s*[•\\-]?\\s*\\(?\\d*\\)?$/.test(titleText)) return false;
            return true;
          };

          const titleSelectors = [
            'a[href*="/p/"]',
            'a[href*="/product/"]',
            'a[title]',
            '._2Kn22P',
            '.s1Q9rs',
            '._2B099V',
            '._2-uG6-',
            '[class*="title"]',
            '[class*="Title"]',
            '[class*="name"]',
          ];

          let title = '';
          for (const selector of titleSelectors) {
            const node = container.querySelector(selector);
            const candidate =
              (node?.getAttribute?.('title') || node?.textContent || '').replace(/\\s+/g, ' ').trim();
            if (isValidTitle(candidate)) {
              title = candidate;
              break;
            }
          }

          if (!title && isValidTitle(imageAlt)) {
            title = imageAlt;
          }

          if (!title) {
            const lines = text
              .split(/\\n|\\r/)
              .map((line) => line.trim())
              .filter((line) => line.length > 2);
            const validLines = lines.filter((line) => isValidTitle(line));
            if (validLines.length > 0) {
              validLines.sort((a, b) => b.length - a.length);
              title = validLines[0];
            }
          }

          const priceSelectors = [
            '._30jeq3',
            '._1_WHN1',
            '.Nx9bqj',
            '[class*="sellingPrice"]',
            '[class*="discountedPrice"]',
            '[class*="finalPrice"]',
            '[class*="price"]',
            '[class*="Price"]',
          ];

          let price = 0;
          for (const selector of priceSelectors) {
            const nodes = Array.from(container.querySelectorAll(selector));
            for (const node of nodes) {
              const parsed = parsePriceFromText(node.textContent || '');
              if (parsed > 0) {
                price = parsed;
                break;
              }
            }
            if (price > 0) break;
          }

          if (!price) {
            const currencyValues = getCurrencyValues(text);
            if (currencyValues.length > 0) {
              // Usually order is selling price, then struck MRP; keep the lower of first two.
              price = Math.min(...currencyValues.slice(0, 2));
            }
          }

          if (!title && price > 0) {
            // Last-resort safe fallback so item isn't dropped when title selector changes.
            title = ('Flipkart item ' + (index + 1)).trim();
          }

          let quantity = 1;
          const qtyMatch = text.match(/Qty\\s*[:\\-]?\\s*(\\d+)/i);
          if (qtyMatch) quantity = parseInt(qtyMatch[1], 10);
          if (!quantity || quantity < 1) {
            const qtyInput = container.querySelector('input[value], select');
            const inputVal = qtyInput ? parseInt(qtyInput.value || qtyInput.getAttribute('value') || '1', 10) : 1;
            quantity = Number.isFinite(inputVal) && inputVal > 0 ? inputVal : 1;
          }

          if (price > 0) {
            const dedupeKey = [title.toLowerCase(), String(price), imageUrl || ('no-image-' + index)].join('|');
            if (seenItems.has(dedupeKey)) return;
            seenItems.add(dedupeKey);
            items.push({
              id: 'fk-' + Date.now() + '-' + index,
              platform: 'flipkart',
              title: title.substring(0, 80),
              price: price,
              quantity: quantity,
              imageUrl: imageUrl,
              url: window.location.href,
              addedAt: new Date().toISOString()
            });
          } else {
            debugLogs.push('Price missing for title: ' + title);
          }
        });

        send({ success: true, items: items, debug: { logs: debugLogs } });
      } catch (error) {
        send({
          success: false,
          error: (error && error.message) ? error.message : 'Flipkart extraction failed'
        });
      }
    })();
  `,

  myntra: `
    (function() {
      const send = (payload) => {
        if (
          window.ReactNativeWebView &&
          typeof window.ReactNativeWebView.postMessage === 'function'
        ) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      };

      try {
        const items = [];
        const seenTitles = new Set();
        const debugLogs = ['Myntra extractor started'];

        const selectorCandidates = [
          '.itemContainer-base-item',
          '.itemComponents-base-cartItem',
          '[class*="cart-item"]',
          '[class*="cartItem"]',
          '[class*="itemContainer"]',
          '[data-testid*="cart-item"]',
        ];

        let cartItems = [];
        for (const selector of selectorCandidates) {
          const matches = Array.from(document.querySelectorAll(selector)).filter(
            (el) => (el.textContent || '').trim().length > 0
          );
          if (matches.length > 0) {
            cartItems = matches;
            debugLogs.push('Using selector: ' + selector + ' (' + matches.length + ' matches)');
            break;
          }
        }

        if (cartItems.length === 0) {
          cartItems = Array.from(document.querySelectorAll('img')).map((img) => {
            let node = img.parentElement;
            for (let i = 0; i < 8 && node; i += 1) {
              const text = (node.textContent || '').trim();
              if (text.match(/(₹|Rs\\.?)/) && text.length > 20) {
                return node;
              }
              node = node.parentElement;
            }
            return null;
          }).filter(Boolean);
          debugLogs.push('Fallback item blocks found: ' + cartItems.length);
        }

        cartItems.forEach((item, i) => {
          const getCurrencyValues = (value) =>
            Array.from((value || '').matchAll(/(?:₹|Rs\\.?|INR)\\s*([0-9][0-9,]*)/gi))
              .map((match) => parseFloat((match[1] || '').replace(/,/g, '')))
              .filter((num) => Number.isFinite(num) && num > 0);

          // Myntra item card often nests title and price in sibling blocks; walk up
          // to find the nearest scope that includes this item's currency values.
          let scope = item;
          for (let depth = 0; depth < 6; depth += 1) {
            if (!scope) break;
            const scopeText = (scope.innerText || scope.textContent || '');
            const currencyCount = getCurrencyValues(scopeText).length;
            const hasPriceNode = !!scope.querySelector(
              '[class*="sellingPrice"], [class*="discountedPrice"], [class*="finalPrice"], [class*="price"], [class*="Price"], [class*="amount"]'
            );
            if (currencyCount > 0 || hasPriceNode) break;
            scope = scope.parentElement;
          }
          if (!scope) scope = item;

          const textContent = (scope.innerText || scope.textContent || '').replace(/\\s+/g, ' ').trim();
          if (!textContent) return;

          const brand =
            ((scope.querySelector('.itemContainer-base-brand, [class*="brand"]') || {}).textContent || '')
              .trim();
          const itemName =
            ((scope.querySelector('.itemContainer-base-itemLink, [class*="itemName"], [class*="name"]') || {})
              .textContent || '')
              .trim();

          let title = [brand, itemName].filter(Boolean).join(' ').trim();
          if (!title) {
            const lines = textContent
              .split(/\\n|\\r/)
              .map((line) => line.trim())
              .filter((line) => line.length > 2);
            const blocked = /(Qty|Size|Sold by|Delivery|OFF|Coupon|Wishlist|Remove|Move to)/i;
            title = lines.find((line) => !blocked.test(line)) || '';
          }

          if (!title || seenTitles.has(title)) return;

          const parseNumericTokens = (value) =>
            Array.from((value || '').matchAll(/\\d[\\d,]*/g))
              .map((match) => parseFloat((match[0] || '').replace(/,/g, '')))
              .filter((num) => Number.isFinite(num) && num >= 10 && num <= 500000);

          const parsePriceFromText = (value) => {
            const currencyValues = getCurrencyValues(value).filter((num) => num <= 500000);
            if (currencyValues.length > 0) return currencyValues[0];
            const tokens = parseNumericTokens(value);
            return tokens.length > 0 ? tokens[0] : 0;
          };

          // Prefer explicit selling-price nodes first so we don't mix MRP/OFF numbers.
          const priceSelectors = [
            '.itemComponents-base-sellingPrice',
            '[class*="sellingPrice"]',
            '[class*="discountedPrice"]',
            '[class*="finalPrice"]',
            '.itemComponents-base-price',
          ];

          let price = 0;
          for (const selector of priceSelectors) {
            const nodes = Array.from(scope.querySelectorAll(selector));
            for (const node of nodes) {
              const parsed = parsePriceFromText(node.textContent || '');
              if (parsed > 0) {
                price = parsed;
                break;
              }
            }
            if (price > 0) break;
          }

          // Fallback: use currency values in scoped text (choose lowest among first few values).
          if (!price) {
            const scopedCurrencyValues = getCurrencyValues(textContent).filter((num) => num <= 500000);
            if (scopedCurrencyValues.length > 0) {
              price = Math.min(...scopedCurrencyValues.slice(0, 3));
            }
          }

          // Final strict fallback from price-related classes only.
          if (!price) {
            const strictNumericValues = Array.from(
              scope.querySelectorAll(
                '[class*="sellingPrice"], [class*="discountedPrice"], [class*="finalPrice"], [class*="price"], [class*="Price"], [class*="amount"]'
              )
            )
              .map((el) => parsePriceFromText(el.textContent || ''))
              .filter((num) => Number.isFinite(num) && num > 0);

            price = strictNumericValues.length > 0 ? strictNumericValues[0] : 0;
          }

          let quantity = 1;
          const qtyMatch = textContent.match(/Qty\\s*[:\\-]?\\s*(\\d+)/i);
          if (qtyMatch) quantity = parseInt(qtyMatch[1], 10);

          const img = item.querySelector('img');
          const imageUrl = img
            ? (img.getAttribute('src') || img.getAttribute('data-src') || '')
            : '';

          if (price > 0) {
            seenTitles.add(title);
            items.push({
              id: 'myn-' + Date.now() + '-' + i,
              platform: 'myntra',
              title: title.substring(0, 80),
              price: price,
              quantity: quantity,
              imageUrl: imageUrl.startsWith('//') ? 'https:' + imageUrl : imageUrl,
              url: window.location.href,
              addedAt: new Date().toISOString()
            });
          } else {
            debugLogs.push('Price not found for title: ' + title);
          }
        });

        send({ 
          success: true, 
          items: items, 
          debug: { logs: debugLogs }
        });
      } catch (error) {
        send({ 
          success: false, 
          error: (error && error.message) ? error.message : 'Unknown injection error'
        });
      }
    })();
  `,
};

export const WebViewCartSync: React.FC<WebViewCartSyncProps> = ({
  platform,
  onClose,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(false);
  const { setAmazonCart, setFlipkartCart, setMyntraCart } = useCartStore();

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      console.log('WebViewCartSync', data);

      if (data.success && data.items) {
        const items: CartItem[] = data.items.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));

        if (items.length === 0) {
          Alert.alert(
            'No Items Found',
            `We couldn't find any items in your ${platform} cart. \n\nMake sure: \n1. You are logged in. \n2. You are actually on the Cart page. \n3. There are items in your cart.`,
            [{ text: 'Try Again' }]
          );
          return;
        }

        // Update the appropriate cart
        switch (platform) {
          case 'amazon':
            setAmazonCart(items);
            break;
          case 'flipkart':
            setFlipkartCart(items);
            break;
          case 'myntra':
            setMyntraCart(items);
            break;
        }

        Alert.alert(
          'Success',
          `Synced ${items.length} items from ${platform}!`,
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to extract cart data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process cart data');
    }
  };

  const extractCartData = () => {
    console.log('extractCartData', platform);
    const script = `
      (function() {
        try {
          ${INJECTION_SCRIPTS[platform]}
        } catch (error) {
          if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              success: false,
              error: (error && error.message) ? error.message : 'Script injection failed'
            }));
          }
        }
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Login to {platform.charAt(0).toUpperCase() + platform.slice(1)}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: PLATFORM_URLS[platform] }}
        originWhitelist={['*']}
        // onLoadStart={() => setLoading(true)}
        // onLoadEnd={() => setLoading(false)}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        style={styles.webview}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading {platform}...</Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.extractButton, loading && styles.extractButtonDisabled]}
          onPress={extractCartData}
          disabled={loading}
        >
          <Text style={styles.extractButtonText}>Extract Cart Data</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  extractButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  extractButtonDisabled: {
    opacity: 0.6,
  },
  extractButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
