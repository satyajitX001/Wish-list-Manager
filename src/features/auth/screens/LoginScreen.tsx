import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Button, Input } from '../../../components';
import { colors, spacing, fontSize, fontWeight } from '../../../theme';
import { validatePhoneNumber } from '../../../utils';
import { Phone, Mail } from 'lucide-react-native';

interface LoginScreenProps {
    onPhoneSubmit: (phone: string) => void;
    onGoogleSignIn: () => void;
    onEmailLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
    onPhoneSubmit,
    onGoogleSignIn,
    onEmailLogin,
}) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePhoneSubmit = () => {
        setError('');

        if (!validatePhoneNumber(phoneNumber)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        onPhoneSubmit(phoneNumber);
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome to</Text>
                        <Text style={styles.appName}>Wish List Manager</Text>
                        <Text style={styles.subtitle}>
                            Manage all your shopping carts in one place
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Phone Number"
                            placeholder="Enter your 10-digit phone number"
                            value={phoneNumber}
                            onChangeText={(text) => {
                                setPhoneNumber(text.replace(/\D/g, ''));
                                setError('');
                            }}
                            keyboardType="phone-pad"
                            maxLength={10}
                            error={error}
                            leftIcon={<Phone size={20} color={colors.textMuted} />}
                        />

                        <Button
                            title="Continue with Phone"
                            onPress={handlePhoneSubmit}
                            loading={loading}
                            disabled={phoneNumber.length !== 10}
                        />

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Button
                            title="Sign in with Google"
                            onPress={onGoogleSignIn}
                            variant="outline"
                            icon={<Mail size={20} color={colors.primary} />}
                        />

                        <TouchableOpacity
                            style={styles.emailButton}
                            onPress={onEmailLogin}
                        >
                            <Text style={styles.emailButtonText}>
                                Sign in with Email instead
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    title: {
        fontSize: fontSize.xl,
        color: colors.textSecondary,
        fontWeight: fontWeight.regular,
    },
    appName: {
        fontSize: fontSize.xxxl,
        color: colors.text,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    form: {
        marginBottom: spacing.xl,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        color: colors.textMuted,
        fontSize: fontSize.sm,
    },
    emailButton: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    emailButtonText: {
        color: colors.primary,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    footer: {
        marginTop: spacing.xl,
    },
    footerText: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 18,
    },
});
