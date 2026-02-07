/**
 * Format price to Indian Rupee format
 */
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price);
};

/**
 * Parse price string to number
 * Handles various formats: ₹1,234.56, $1234.56, 1234.56, etc.
 */
export const parsePrice = (priceString: string): number => {
    // Remove currency symbols, commas, and spaces
    const cleaned = priceString.replace(/[₹$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format large numbers with K, L, Cr suffixes
 */
export const formatCompactNumber = (num: number): string => {
    if (num >= 10000000) {
        return `₹${(num / 10000000).toFixed(2)}Cr`;
    } else if (num >= 100000) {
        return `₹${(num / 100000).toFixed(2)}L`;
    } else if (num >= 1000) {
        return `₹${(num / 1000).toFixed(1)}K`;
    }
    return formatPrice(num);
};
