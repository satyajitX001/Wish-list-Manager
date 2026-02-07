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
      try {
        const items = [];
        const seenTitles = new Set();
        const selectors = ['.sc-list-item', '.sc-mobile-cart-list-item', '[id^="sc-item-"]'];
        
        let cartItems = [];
        for (const selector of selectors) {
          const found = document.querySelectorAll(selector);
          if (found.length > 0) { cartItems = Array.from(found); break; }
        }

        if (cartItems.length === 0) {
          cartItems = Array.from(document.querySelectorAll('div')).filter(el => 
            el.innerText && (el.innerText.includes('Delete') || el.innerText.includes('Qty:')) && el.querySelector('img')
          );
        }
        
        cartItems.forEach((item, index) => {
          const titleEl = item.querySelector('.sc-product-title, .a-size-medium, h2, .sc-grid-item-product-title');
          const title = (titleEl?.innerText || '').trim();
          
          if (!title || seenTitles.has(title)) return;
          seenTitles.add(title);

          const priceContainer = item.querySelector('.sc-price, .a-price');
          let priceText = priceContainer ? priceContainer.innerText : '0';
          // Fix: Extract only the FIRST price found in the text to avoid MRP/Discount merge
          const priceMatch = priceText.match(/([0-9,.]+)/);
          const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
          
          let quantity = 1;
          const qtySelect = item.querySelector('select[name^="quantity"]');
          if (qtySelect) {
            quantity = parseInt(qtySelect.value);
          } else {
            const qtyText = item.querySelector('.a-dropdown-prompt, [class*="quantity"]')?.innerText || '';
            const qtyMatch = qtyText.match(/(\\d+)/);
            if (qtyMatch) quantity = parseInt(qtyMatch[0]);
          }
          
          const img = item.querySelector('img');
          const imageUrl = img ? img.src : '';
          
          if (price > 0) {
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
        
        window.ReactNativeWebView.postMessage(JSON.stringify({ success: true, items: items }));
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ success: false, error: error.message }));
      }
    })();
  `,

  flipkart: `
    (function() {
      try {
        const items = [];
        const seenTitles = new Set();
        // Look for the "Remove" buttons - they are the most reliable marker of a cart item
        const removeButtons = Array.from(document.querySelectorAll('div, span')).filter(el => 
          el.innerText === 'Remove' && el.offsetWidth > 0
        );

        removeButtons.forEach((btn, index) => {
          // Find the main container for this item (usually 3-5 levels up)
          let container = btn.parentElement;
          for(let i=0; i<6; i++) {
            if (container.innerText.includes('Sync') || container.querySelector('img')) break;
            container = container.parentElement;
          }

          const priceEl = Array.from(container.querySelectorAll('span, div')).find(el => el.innerText && el.innerText.startsWith('₹'));
          const priceMatch = (priceEl?.innerText || '0').match(/([0-9,.]+)/);
          const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;

          const titleEl = container.querySelector('._2-4wDl, .sFPrp7, a[class*="title"], [class*="name"]');
          const title = (titleEl?.innerText || '').trim();
          
          if (!title || seenTitles.has(title)) return;
          seenTitles.add(title);

          const img = container.querySelector('img');
          const imageUrl = img ? img.src : '';
          
          // Detect quantity
          let quantity = 1;
          const qtyTags = Array.from(container.querySelectorAll('div, span, input')).filter(el => 
             el.innerText && el.innerText.match(/Qty|Qty:/i)
          );
          if (qtyTags.length > 0) {
            const qMatch = qtyTags[0].parentElement.innerText.match(/(\\d+)/);
            if (qMatch) quantity = parseInt(qMatch[0]);
          }

          if (price > 0) {
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
          }
        });
        
        window.ReactNativeWebView.postMessage(JSON.stringify({ success: true, items: items }));
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ success: false, error: error.message }));
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
          const textContent = (item.innerText || item.textContent || '').replace(/\\s+/g, ' ').trim();
          if (!textContent) return;

          const brand =
            ((item.querySelector('.itemContainer-base-brand, [class*="brand"]') || {}).textContent || '')
              .trim();
          const itemName =
            ((item.querySelector('.itemContainer-base-itemLink, [class*="itemName"], [class*="name"]') || {})
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

          const priceSource =
            ((item.querySelector(
              '.itemComponents-base-sellingPrice, [class*="sellingPrice"], [class*="discountedPrice"], [class*="price"]'
            ) || {}).textContent || textContent);
          const priceMatch = priceSource.match(/(?:₹|Rs\\.?)\\s*([0-9][0-9,]*)/i);
          let price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
          if (!price) {
            const numericFallback = textContent.match(/\\b([1-9][0-9]{2,5})\\b/);
            price = numericFallback ? parseFloat(numericFallback[1]) : 0;
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
  const [loading, setLoading] = useState(true);
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
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
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
