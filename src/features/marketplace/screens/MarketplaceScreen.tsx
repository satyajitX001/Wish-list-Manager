import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Card } from '../../../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../theme';
import { formatPrice } from '../../../utils';
import { useCartStore, CartItem } from '../../../store';
import { ShoppingCart, Plus } from 'lucide-react-native';

// Mock data for our platform items
const MOCK_ITEMS: Omit<CartItem, 'addedAt'>[] = [
    {
        id: '1',
        platform: 'ourPlatform',
        title: 'Premium Wireless Headphones',
        price: 2999,
        originalPrice: 4999,
        imageUrl: 'https://via.placeholder.com/150',
        quantity: 1,
    },
    {
        id: '2',
        platform: 'ourPlatform',
        title: 'Smart Watch Series 5',
        price: 12999,
        originalPrice: 18999,
        imageUrl: 'https://via.placeholder.com/150',
        quantity: 1,
    },
    {
        id: '3',
        platform: 'ourPlatform',
        title: 'Laptop Backpack',
        price: 1499,
        originalPrice: 2499,
        imageUrl: 'https://via.placeholder.com/150',
        quantity: 1,
    },
    {
        id: '4',
        platform: 'ourPlatform',
        title: 'Bluetooth Speaker',
        price: 1999,
        originalPrice: 3499,
        imageUrl: 'https://via.placeholder.com/150',
        quantity: 1,
    },
];

export const MarketplaceScreen: React.FC = () => {
    const addOurPlatformItem = useCartStore((state) => state.addOurPlatformItem);
    const ourPlatformItems = useCartStore((state) => state.ourPlatformItems);

    const handleAddToCart = (item: Omit<CartItem, 'addedAt'>) => {
        // Check if item already in cart
        const existingItem = ourPlatformItems.find((i) => i.id === item.id);
        if (existingItem) {
            return;
        }

        addOurPlatformItem({
            ...item,
            addedAt: new Date(),
        });
    };

    const isInCart = (itemId: string) => {
        return ourPlatformItems.some((item) => item.id === itemId);
    };

    const renderItem = ({ item }: { item: Omit<CartItem, 'addedAt'> }) => {
        const inCart = isInCart(item.id);
        const discount = item.originalPrice
            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
            : 0;

        return (
            <Card style={styles.itemCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{formatPrice(item.price)}</Text>
                        {item.originalPrice && (
                            <>
                                <Text style={styles.originalPrice}>
                                    {formatPrice(item.originalPrice)}
                                </Text>
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>{discount}% OFF</Text>
                                </View>
                            </>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[styles.addButton, inCart && styles.addButtonDisabled]}
                        onPress={() => handleAddToCart(item)}
                        disabled={inCart}
                    >
                        {inCart ? (
                            <ShoppingCart size={16} color={colors.white} />
                        ) : (
                            <Plus size={16} color={colors.white} />
                        )}
                        <Text style={styles.addButtonText}>
                            {inCart ? 'In Cart' : 'Add to Cart'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Our Marketplace</Text>
                <Text style={styles.headerSubtitle}>
                    Discover amazing deals on our platform
                </Text>
            </View>
            <FlatList
                data={MOCK_ITEMS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    listContent: {
        padding: spacing.lg,
    },
    itemCard: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    itemImage: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.md,
        backgroundColor: colors.backgroundLight,
    },
    itemInfo: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'space-between',
    },
    itemTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    price: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    originalPrice: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        backgroundColor: colors.success,
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    discountText: {
        fontSize: fontSize.xs,
        color: colors.white,
        fontWeight: fontWeight.semibold,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
        alignSelf: 'flex-start',
    },
    addButtonDisabled: {
        backgroundColor: colors.success,
    },
    addButtonText: {
        color: colors.white,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
});
