import { create } from 'zustand';

export type Platform = 'amazon' | 'flipkart' | 'myntra' | 'ourPlatform';

export interface CartItem {
    id: string;
    platform: Platform;
    title: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    quantity: number;
    url?: string;
    addedAt: Date;
}

interface CartState {
    externalCarts: {
        amazon: CartItem[];
        flipkart: CartItem[];
        myntra: CartItem[];
    };
    ourPlatformItems: CartItem[];

    // Actions
    setAmazonCart: (items: CartItem[]) => void;
    setFlipkartCart: (items: CartItem[]) => void;
    setMyntraCart: (items: CartItem[]) => void;
    addOurPlatformItem: (item: CartItem) => void;
    removeOurPlatformItem: (itemId: string) => void;
    updateItemQuantity: (platform: Platform, itemId: string, quantity: number) => void;

    // Computed
    getAllCartItems: () => CartItem[];
    getTotalItems: () => number;
    getTotalSpend: () => number;
    getPlatformTotal: (platform: Platform) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    externalCarts: {
        amazon: [],
        flipkart: [],
        myntra: [],
    },
    ourPlatformItems: [],

    setAmazonCart: (items) =>
        set((state) => ({
            externalCarts: { ...state.externalCarts, amazon: items },
        })),

    setFlipkartCart: (items) =>
        set((state) => ({
            externalCarts: { ...state.externalCarts, flipkart: items },
        })),

    setMyntraCart: (items) =>
        set((state) => ({
            externalCarts: { ...state.externalCarts, myntra: items },
        })),

    addOurPlatformItem: (item) =>
        set((state) => ({
            ourPlatformItems: [...state.ourPlatformItems, item],
        })),

    removeOurPlatformItem: (itemId) =>
        set((state) => ({
            ourPlatformItems: state.ourPlatformItems.filter((item) => item.id !== itemId),
        })),

    updateItemQuantity: (platform, itemId, quantity) =>
        set((state) => {
            if (platform === 'ourPlatform') {
                return {
                    ourPlatformItems: state.ourPlatformItems.map((item) =>
                        item.id === itemId ? { ...item, quantity } : item
                    ),
                };
            } else {
                return {
                    externalCarts: {
                        ...state.externalCarts,
                        [platform]: state.externalCarts[platform].map((item) =>
                            item.id === itemId ? { ...item, quantity } : item
                        ),
                    },
                };
            }
        }),

    getAllCartItems: () => {
        const state = get();
        return [
            ...state.ourPlatformItems,
            ...state.externalCarts.amazon,
            ...state.externalCarts.flipkart,
            ...state.externalCarts.myntra,
        ];
    },

    getTotalItems: () => {
        const items = get().getAllCartItems();
        return items.reduce((sum, item) => sum + item.quantity, 0);
    },

    getTotalSpend: () => {
        const items = get().getAllCartItems();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },

    getPlatformTotal: (platform) => {
        const state = get();
        const items =
            platform === 'ourPlatform'
                ? state.ourPlatformItems
                : state.externalCarts[platform];
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
}));
