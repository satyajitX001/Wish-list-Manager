import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { Card } from '../../../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../theme';
import { formatPrice, formatCompactNumber } from '../../../utils';
import { useCartStore } from '../../../store';
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const AccountingScreen: React.FC = () => {
    const {
        getTotalSpend,
        getTotalItems,
        getPlatformTotal,
        externalCarts,
        ourPlatformItems,
    } = useCartStore();

    const totalSpend = getTotalSpend();
    const totalItems = getTotalItems();

    const platformData = [
        {
            name: 'Our Platform',
            total: getPlatformTotal('ourPlatform'),
            color: colors.ourPlatform,
            items: ourPlatformItems.length,
        },
        {
            name: 'Amazon',
            total: getPlatformTotal('amazon'),
            color: colors.amazon,
            items: externalCarts.amazon.length,
        },
        {
            name: 'Flipkart',
            total: getPlatformTotal('flipkart'),
            color: colors.flipkart,
            items: externalCarts.flipkart.length,
        },
        {
            name: 'Myntra',
            total: getPlatformTotal('myntra'),
            color: colors.myntra,
            items: externalCarts.myntra.length,
        },
    ].filter((platform) => platform.items > 0);

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simulate data refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const StatCard = ({
        icon,
        label,
        value,
        color,
    }: {
        icon: React.ReactNode;
        label: string;
        value: string;
        color: string;
    }) => (
        <Card style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                {icon}
            </View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </Card>
    );

    const PlatformBreakdown = () => (
        <Card style={styles.breakdownCard}>
            <Text style={styles.sectionTitle}>Platform Breakdown</Text>
            {platformData.map((platform, index) => {
                const percentage = totalSpend > 0 ? (platform.total / totalSpend) * 100 : 0;
                return (
                    <View key={index} style={styles.platformRow}>
                        <View style={styles.platformInfo}>
                            <View
                                style={[styles.platformDot, { backgroundColor: platform.color }]}
                            />
                            <Text style={styles.platformName}>{platform.name}</Text>
                            <Text style={styles.platformItems}>({platform.items} items)</Text>
                        </View>
                        <View style={styles.platformRight}>
                            <Text style={styles.platformTotal}>
                                {formatPrice(platform.total)}
                            </Text>
                            <Text style={styles.platformPercentage}>
                                {percentage.toFixed(1)}%
                            </Text>
                        </View>
                    </View>
                );
            })}
        </Card>
    );

    const SpendingChart = () => (
        <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Spending Distribution</Text>
            <View style={styles.chartContainer}>
                {platformData.map((platform, index) => {
                    const percentage = totalSpend > 0 ? (platform.total / totalSpend) * 100 : 0;
                    return (
                        <View key={index} style={styles.barContainer}>
                            <View style={styles.barWrapper}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: `${percentage}%`,
                                            backgroundColor: platform.color,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.barLabel} numberOfLines={1}>
                                {platform.name}
                            </Text>
                            <Text style={styles.barValue}>{formatCompactNumber(platform.total)}</Text>
                        </View>
                    );
                })}
            </View>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Accounting</Text>
                <Text style={styles.headerSubtitle}>Track your spending across platforms</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                <View style={styles.statsGrid}>
                    <StatCard
                        icon={<DollarSign size={24} color={colors.primary} />}
                        label="Total Spend"
                        value={formatPrice(totalSpend)}
                        color={colors.primary}
                    />
                    <StatCard
                        icon={<ShoppingCart size={24} color={colors.secondary} />}
                        label="Total Items"
                        value={totalItems.toString()}
                        color={colors.secondary}
                    />
                </View>

                <View style={styles.statsGrid}>
                    <StatCard
                        icon={<Package size={24} color={colors.info} />}
                        label="Platforms"
                        value={platformData.length.toString()}
                        color={colors.info}
                    />
                    <StatCard
                        icon={<TrendingUp size={24} color={colors.success} />}
                        label="Avg. Price"
                        value={
                            totalItems > 0
                                ? formatPrice(Math.round(totalSpend / totalItems))
                                : formatPrice(0)
                        }
                        color={colors.success}
                    />
                </View>

                {platformData.length > 0 && (
                    <>
                        <SpendingChart />
                        <PlatformBreakdown />
                    </>
                )}

                {platformData.length === 0 && (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>
                            No data available. Add items to your cart to see spending analytics.
                        </Text>
                    </Card>
                )}
            </ScrollView>
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
    scrollContent: {
        padding: spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.lg,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    breakdownCard: {
        marginTop: spacing.md,
    },
    platformRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    platformInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    platformDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    platformName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    platformItems: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    platformRight: {
        alignItems: 'flex-end',
    },
    platformTotal: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    platformPercentage: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    chartCard: {
        marginBottom: spacing.md,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 200,
        paddingTop: spacing.lg,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginHorizontal: spacing.xs,
    },
    barWrapper: {
        width: '100%',
        height: 150,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bar: {
        width: '80%',
        borderTopLeftRadius: borderRadius.sm,
        borderTopRightRadius: borderRadius.sm,
        minHeight: 10,
    },
    barLabel: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    barValue: {
        fontSize: fontSize.xs,
        color: colors.text,
        fontWeight: fontWeight.semibold,
        marginTop: 2,
    },
    emptyCard: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        textAlign: 'center',
    },
});
