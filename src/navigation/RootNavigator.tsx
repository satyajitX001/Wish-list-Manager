import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../api/firebase';
import { useAuthStore } from '../store';
import { colors } from '../theme';
import { LoginScreen, OTPScreen } from '../features/auth';
import { TabNavigator } from './TabNavigator';

export type RootStackParamList = {
    Login: undefined;
    OTP: { phoneNumber: string };
    Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
    const { isAuthenticated, setUser, setLoading, isLoading } = useAuthStore();
    const [currentPhone, setCurrentPhone] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || undefined,
                    phoneNumber: firebaseUser.phoneNumber || undefined,
                    displayName: firebaseUser.displayName || undefined,
                    photoURL: firebaseUser.photoURL || undefined,
                });
            } else {
                setUser(null);
            }
        });

        return unsubscribe;
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>

                {/* {!isAuthenticated ? (
                    <>
                        <Stack.Screen name="Login">
                            {({ navigation }) => (
                                <LoginScreen
                                    onPhoneSubmit={(phone) => {
                                        setCurrentPhone(phone);
                                        navigation.navigate('OTP', { phoneNumber: phone });
                                    }}
                                    onGoogleSignIn={() => {
                                        // TODO: Implement Google Sign-in
                                        console.log('Google Sign-in');
                                    }}
                                    onEmailLogin={() => {
                                        // TODO: Implement Email Login
                                        console.log('Email Login');
                                    }}
                                />
                            )}
                        </Stack.Screen>
                        <Stack.Screen name="OTP">
                            {({ route, navigation }) => (
                                <OTPScreen
                                    phoneNumber={route.params.phoneNumber}
                                    onVerify={(otp) => {
                                        // TODO: Implement OTP verification
                                        console.log('Verify OTP:', otp);
                                        // For now, simulate successful login
                                        setUser({
                                            uid: 'demo-user',
                                            phoneNumber: route.params.phoneNumber,
                                        });
                                    }}
                                    onResend={() => {
                                        console.log('Resend OTP');
                                    }}
                                    onBack={() => navigation.goBack()}
                                />
                            )}
                        </Stack.Screen>
                    </>
                ) : (
                    <Stack.Screen name="Main" component={TabNavigator} />
                )} */}
                <Stack.Screen name="Main" component={TabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});
