import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Button } from '../../../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../theme';
import { fetchExternalCarts } from '../../../api/mockData';
import { useCartStore } from '../../../store';
import { RefreshCw, ShoppingBag } from 'lucide-react-native';

export const SyncCartsButton: React.FC = () => {
    const [syncing, setSyncing] = useState(false);
    const { setAmazonCart, setFlipkartCart, setMyntraCart } = useCartStore();

    const handleSync = async () => {
        setSyncing(true);
        try {
            const carts = await fetchExternalCarts();
            setAmazonCart(carts.amazon);
            setFlipkartCart(carts.flipkart);
            setMyntraCart(carts.myntra);

            Alert.alert(
                'Success',
                'External carts synced successfully!',
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to sync external carts. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setSyncing(false);
        }
    };

    return (
        <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={syncing}
        >
            <RefreshCw
                size={20}
                color={colors.primary}
                style={syncing ? styles.spinning : undefined}
            />
            <Text style={styles.syncText}>
                {syncing ? 'Syncing...' : 'Sync External Carts'}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundCard,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.primary,
        gap: spacing.xs,
    },
    syncText: {
        color: colors.primary,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    spinning: {
        // Note: You'd need to add animation here with Animated API
    },
});
