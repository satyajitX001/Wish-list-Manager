import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    SectionList,
    Modal,
    RefreshControl,
} from 'react-native';
import { Card } from '../../../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../theme';
import { formatPrice } from '../../../utils';
import { useCartStore, CartItem, Platform } from '../../../store';
import { ShoppingBag, Trash2, Plus, Minus, ExternalLink, PlusCircle } from 'lucide-react-native';
import { SyncCartsButton } from '../components/SyncCartsButton';
import { AddItemManually } from '../components/AddItemManually';
import { WebViewCartSync } from '../components/WebViewCartSync';
import { DrawerMenuButton } from '../../../navigation/components/DrawerMenuButton';

const PLATFORM_COLORS = {
    amazon: colors.amazon,
    flipkart: colors.flipkart,
    myntra: colors.myntra,
    ourPlatform: colors.ourPlatform,
};

const PLATFORM_NAMES = {
    amazon: 'Amazon',
    flipkart: 'Flipkart',
    myntra: 'Myntra',
    ourPlatform: 'Our Platform',
};

export const AggregatorScreen: React.FC = () => {
    const {
        externalCarts,
        ourPlatformItems,
        updateItemQuantity,
        removeOurPlatformItem,
        getTotalSpend,
        getTotalItems,
        getPlatformTotal,
    } = useCartStore();

    const [showAddManual, setShowAddManual] = useState(false);
    const [showWebView, setShowWebView] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<'amazon' | 'flipkart' | 'myntra' | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate data fetch or refresh logic
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const allItems = [
        ...ourPlatformItems.map((item) => ({ ...item, platform: 'ourPlatform' as Platform })),
        ...externalCarts.amazon,
        ...externalCarts.flipkart,
        ...externalCarts.myntra,
    ];

    const groupedItems = allItems.reduce((acc, item) => {
        if (!acc[item.platform]) {
            acc[item.platform] = [];
        }
        acc[item.platform].push(item);
        return acc;
    }, {} as Record<Platform, CartItem[]>);

    const sections = Object.entries(groupedItems).map(([platform, items]) => ({
        title: platform as Platform,
        data: items,
    }));

    const handleQuantityChange = (platform: Platform, itemId: string, delta: number) => {
        const item = allItems.find((i) => i.id === itemId);
        if (item) {
            const newQuantity = Math.max(1, item.quantity + delta);
            updateItemQuantity(platform, itemId, newQuantity);
        }
    };

    const handleRemoveItem = (itemId: string) => {
        removeOurPlatformItem(itemId);
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <Card style={styles.itemCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
                <View style={styles.itemActions}>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.platform, item.id, -1)}
                        >
                            <Minus size={16} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.platform, item.id, 1)}
                        >
                            <Plus size={16} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    {item.platform === 'ourPlatform' && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleRemoveItem(item.id)}
                        >
                            <Trash2 size={18} color={colors.error} />
                        </TouchableOpacity>
                    )}
                    {item.url && (
                        <TouchableOpacity style={styles.linkButton}>
                            <ExternalLink size={18} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Card>
    );

    const renderSectionHeader = ({ section }: { section: { title: Platform } }) => {
        const platformTotal = getPlatformTotal(section.title);
        const itemCount = groupedItems[section.title]?.length || 0;
        return (
            <View
                style={[
                    styles.sectionHeader,
                    { borderLeftColor: PLATFORM_COLORS[section.title] },
                ]}
            >
                <View style={styles.sectionHeaderLeft}>
                    <View
                        style={[
                            styles.platformDot,
                            { backgroundColor: PLATFORM_COLORS[section.title] },
                        ]}
                    />
                    <Text style={styles.sectionTitle}>
                        {PLATFORM_NAMES[section.title]}
                    </Text>
                    <Text style={styles.itemCount}>({itemCount} items)</Text>
                </View>
                <Text style={styles.platformTotal}>{formatPrice(platformTotal)}</Text>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <ShoppingBag size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
                Add items from our marketplace or sync your external carts
            </Text>
            <View style={styles.syncButtonContainer}>
                <SyncCartsButton />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>Unified Cart</Text>
                    <Text style={styles.headerSubtitle}>All your shopping in one place</Text>
                </View>
                <View style={styles.headerActions}>
                    <DrawerMenuButton />
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setShowAddManual(true)}
                    >
                        <PlusCircle size={26} color={colors.primary} />
                    </TouchableOpacity>
                    <SyncCartsButton />
                </View>
            </View>

            <View style={styles.platformSyncContainer}>
                <Text style={styles.platformSyncTitle}>External Sync:</Text>
                <View style={styles.platformButtons}>
                    {(['amazon', 'flipkart', 'myntra'] as const).map((platform) => (
                        <TouchableOpacity
                            key={platform}
                            style={[styles.platformButton, { borderColor: PLATFORM_COLORS[platform] }]}
                            onPress={() => {
                                setSelectedPlatform(platform);
                                setShowWebView(true);
                            }}
                        >
                            <Text style={[styles.platformButtonText, { color: PLATFORM_COLORS[platform] }]}>
                                {PLATFORM_NAMES[platform]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {allItems.length === 0 ? (
                renderEmptyState()
            ) : (
                <>
                    <SectionList
                        sections={sections}
                        renderItem={renderItem}
                        renderSectionHeader={renderSectionHeader}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        stickySectionHeadersEnabled={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                        }
                    />
                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Items:</Text>
                            <Text style={styles.totalValue}>{getTotalItems()}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Amount:</Text>
                            <Text style={styles.totalAmount}>{formatPrice(getTotalSpend())}</Text>
                        </View>
                    </View>
                </>
            )}

            <AddItemManually visible={showAddManual} onClose={() => setShowAddManual(false)} />

            <Modal visible={showWebView} animationType="slide" presentationStyle="fullScreen">
                {selectedPlatform && (
                    <WebViewCartSync
                        platform={selectedPlatform}
                        onClose={() => {
                            setShowWebView(false);
                            setSelectedPlatform(null);
                        }}
                    />
                )}
            </Modal>
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
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerLeft: {
        flex: 1,
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconButton: {
        padding: spacing.xs,
    },
    platformSyncContainer: {
        padding: spacing.md,
        backgroundColor: colors.backgroundLight,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    platformSyncTitle: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
        color: colors.textMuted,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    platformButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    platformButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1.5,
        alignItems: 'center',
        backgroundColor: colors.backgroundCard,
    },
    platformButtonText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
    },
    listContent: {
        padding: spacing.lg,
        paddingBottom: 140,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.backgroundLight,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    platformDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    itemCount: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    platformTotal: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    itemCard: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    itemImage: {
        width: 80,
        height: 80,
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
    price: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
        borderRadius: borderRadius.md,
        padding: spacing.xs,
    },
    quantityButton: {
        padding: spacing.xs,
    },
    quantity: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        paddingHorizontal: spacing.md,
    },
    deleteButton: {
        padding: spacing.xs,
    },
    linkButton: {
        padding: spacing.xs,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.backgroundCard,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    totalLabel: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    totalValue: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    totalAmount: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        textAlign: 'center',
    },
    syncButtonContainer: {
        marginTop: spacing.xl,
    },
});
