// Mock data for external carts (for testing)
import { CartItem } from '../store';

export const MOCK_AMAZON_CART: CartItem[] = [
    {
        id: 'amz-1',
        platform: 'amazon',
        title: 'Sony WH-1000XM4 Wireless Headphones',
        price: 24990,
        originalPrice: 29990,
        imageUrl: 'https://via.placeholder.com/150/FF9900/FFFFFF?text=Amazon',
        quantity: 1,
        url: 'https://amazon.in/...',
        addedAt: new Date('2024-02-01'),
    },
    {
        id: 'amz-2',
        platform: 'amazon',
        title: 'Kindle Paperwhite (11th Gen)',
        price: 13999,
        originalPrice: 14999,
        imageUrl: 'https://via.placeholder.com/150/FF9900/FFFFFF?text=Amazon',
        quantity: 1,
        url: 'https://amazon.in/...',
        addedAt: new Date('2024-02-02'),
    },
];

export const MOCK_FLIPKART_CART: CartItem[] = [
    {
        id: 'fk-1',
        platform: 'flipkart',
        title: 'Samsung Galaxy Buds2 Pro',
        price: 11999,
        originalPrice: 17999,
        imageUrl: 'https://via.placeholder.com/150/2874F0/FFFFFF?text=Flipkart',
        quantity: 2,
        url: 'https://flipkart.com/...',
        addedAt: new Date('2024-02-03'),
    },
    {
        id: 'fk-2',
        platform: 'flipkart',
        title: 'Mi Smart Band 7',
        price: 2799,
        originalPrice: 3999,
        imageUrl: 'https://via.placeholder.com/150/2874F0/FFFFFF?text=Flipkart',
        quantity: 1,
        url: 'https://flipkart.com/...',
        addedAt: new Date('2024-02-04'),
    },
];

export const MOCK_MYNTRA_CART: CartItem[] = [
    {
        id: 'myn-1',
        platform: 'myntra',
        title: 'Nike Air Max 270 Sneakers',
        price: 8995,
        originalPrice: 12995,
        imageUrl: 'https://via.placeholder.com/150/FF3F6C/FFFFFF?text=Myntra',
        quantity: 1,
        url: 'https://myntra.com/...',
        addedAt: new Date('2024-02-05'),
    },
    {
        id: 'myn-2',
        platform: 'myntra',
        title: 'Levi\'s 511 Slim Fit Jeans',
        price: 2499,
        originalPrice: 3999,
        imageUrl: 'https://via.placeholder.com/150/FF3F6C/FFFFFF?text=Myntra',
        quantity: 2,
        url: 'https://myntra.com/...',
        addedAt: new Date('2024-02-06'),
    },
];

/**
 * Simulate fetching external cart data
 * In production, this would call a backend service or use WebView injection
 */
export const fetchExternalCarts = async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        amazon: MOCK_AMAZON_CART,
        flipkart: MOCK_FLIPKART_CART,
        myntra: MOCK_MYNTRA_CART,
    };
};
