import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Input, Button, Card } from '../../../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../theme';
import { useCartStore, Platform } from '../../../store';
import { X, Plus } from 'lucide-react-native';

interface AddItemManuallyProps {
    visible: boolean;
    onClose: () => void;
}

export const AddItemManually: React.FC<AddItemManuallyProps> = ({
    visible,
    onClose,
}) => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [imageUrl, setImageUrl] = useState('');
    const [url, setUrl] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>('amazon');

    const { setAmazonCart, setFlipkartCart, setMyntraCart, externalCarts } =
        useCartStore();

    const platforms: { value: Platform; label: string; color: string }[] = [
        { value: 'amazon', label: 'Amazon', color: colors.amazon },
        { value: 'flipkart', label: 'Flipkart', color: colors.flipkart },
        { value: 'myntra', label: 'Myntra', color: colors.myntra },
    ];

    const handleAdd = () => {
        if (!title.trim() || !price.trim()) {
            Alert.alert('Error', 'Please fill in at least title and price');
            return;
        }

        const newItem = {
            id: `manual-${selectedPlatform}-${Date.now()}`,
            platform: selectedPlatform,
            title: title.trim(),
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
            quantity: parseInt(quantity) || 1,
            imageUrl:
                imageUrl.trim() ||
                `https://via.placeholder.com/150/${selectedPlatform === 'amazon'
                    ? 'FF9900'
                    : selectedPlatform === 'flipkart'
                        ? '2874F0'
                        : 'FF3F6C'
                }/FFFFFF?text=${selectedPlatform}`,
            url: url.trim() || undefined,
            addedAt: new Date(),
        };

        // Get current cart for the platform
        const currentCart = externalCarts[selectedPlatform];

        // Add to appropriate cart
        switch (selectedPlatform) {
            case 'amazon':
                setAmazonCart([...currentCart, newItem]);
                break;
            case 'flipkart':
                setFlipkartCart([...currentCart, newItem]);
                break;
            case 'myntra':
                setMyntraCart([...currentCart, newItem]);
                break;
        }

        Alert.alert('Success', `Item added to ${selectedPlatform} cart!`);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setTitle('');
        setPrice('');
        setOriginalPrice('');
        setQuantity('1');
        setImageUrl('');
        setUrl('');
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Add Item Manually</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <Card style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Platform</Text>
                        <View style={styles.platformSelector}>
                            {platforms.map((platform) => (
                                <TouchableOpacity
                                    key={platform.value}
                                    style={[
                                        styles.platformOption,
                                        selectedPlatform === platform.value && {
                                            borderColor: platform.color,
                                            backgroundColor: platform.color + '20',
                                        },
                                    ]}
                                    onPress={() => setSelectedPlatform(platform.value)}
                                >
                                    <Text
                                        style={[
                                            styles.platformOptionText,
                                            selectedPlatform === platform.value && {
                                                color: platform.color,
                                                fontWeight: fontWeight.bold,
                                            },
                                        ]}
                                    >
                                        {platform.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    <Card style={styles.section}>
                        <Text style={styles.sectionTitle}>Item Details</Text>

                        <Input
                            label="Item Title *"
                            placeholder="e.g., Sony WH-1000XM4 Headphones"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Input
                            label="Price (₹) *"
                            placeholder="e.g., 24990"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="decimal-pad"
                        />

                        <Input
                            label="Original Price (₹)"
                            placeholder="e.g., 29990 (optional)"
                            value={originalPrice}
                            onChangeText={setOriginalPrice}
                            keyboardType="decimal-pad"
                        />

                        <Input
                            label="Quantity"
                            placeholder="1"
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="number-pad"
                        />

                        <Input
                            label="Image URL (optional)"
                            placeholder="https://..."
                            value={imageUrl}
                            onChangeText={setImageUrl}
                            autoCapitalize="none"
                        />

                        <Input
                            label="Product URL (optional)"
                            placeholder="https://..."
                            value={url}
                            onChangeText={setUrl}
                            autoCapitalize="none"
                        />
                    </Card>

                    <View style={styles.actions}>
                        <Button
                            title="Add to Cart"
                            onPress={handleAdd}
                            icon={<Plus size={20} color={colors.white} />}
                        />
                        <Button
                            title="Cancel"
                            onPress={onClose}
                            variant="outline"
                            style={styles.cancelButton}
                        />
                    </View>
                </ScrollView>
            </View>
        </Modal>
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
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.xs,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    platformSelector: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    platformOption: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
    },
    platformOptionText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    actions: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    cancelButton: {
        marginTop: spacing.sm,
    },
});
