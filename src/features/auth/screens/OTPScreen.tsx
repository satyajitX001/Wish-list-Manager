import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { Button } from '../../../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../theme';
import { validateOTP } from '../../../utils';

interface OTPScreenProps {
    phoneNumber: string;
    onVerify: (otp: string) => void;
    onResend: () => void;
    onBack: () => void;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({
    phoneNumber,
    onVerify,
    onResend,
    onBack,
}) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleOtpChange = (value: string, index: number) => {
        if (value.length > 1) {
            // Handle paste
            const otpArray = value.slice(0, 6).split('');
            const newOtp = [...otp];
            otpArray.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });
            setOtp(newOtp);

            // Focus last filled input
            const lastIndex = Math.min(index + otpArray.length - 1, 5);
            inputRefs.current[lastIndex]?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const otpString = otp.join('');
        if (validateOTP(otpString)) {
            setLoading(true);
            onVerify(otpString);
        }
    };

    const isOtpComplete = otp.every((digit) => digit !== '');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Enter OTP</Text>
                    <Text style={styles.subtitle}>
                        We've sent a 6-digit code to{'\n'}
                        <Text style={styles.phoneNumber}>{phoneNumber}</Text>
                    </Text>
                </View>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={[styles.otpInput, digit && styles.otpInputFilled]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <Button
                    title="Verify OTP"
                    onPress={handleVerify}
                    loading={loading}
                    disabled={!isOtpComplete}
                    style={styles.verifyButton}
                />

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive the code? </Text>
                    <TouchableOpacity onPress={onResend}>
                        <Text style={styles.resendButton}>Resend OTP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    backButton: {
        marginBottom: spacing.lg,
    },
    backButtonText: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    title: {
        fontSize: fontSize.xxxl,
        color: colors.text,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    phoneNumber: {
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    otpInput: {
        width: 48,
        height: 56,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        fontSize: fontSize.xxl,
        color: colors.text,
        textAlign: 'center',
        backgroundColor: colors.backgroundCard,
    },
    otpInputFilled: {
        borderColor: colors.primary,
    },
    verifyButton: {
        marginTop: spacing.lg,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.lg,
    },
    resendText: {
        color: colors.textMuted,
        fontSize: fontSize.sm,
    },
    resendButton: {
        color: colors.primary,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
});
