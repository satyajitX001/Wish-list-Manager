import React, { useMemo, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../api/firebase';
import { useAuthStore, useThemeStore } from '../store';
import { themePalettes } from '../theme';
import { DrawerNavigator } from './DrawerNavigator';

export type RootStackParamList = {
    Login: undefined;
    OTP: { phoneNumber: string };
    Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
    const { setUser, isLoading } = useAuthStore();
    const mode = useThemeStore((state) => state.mode);
    const palette = themePalettes[mode];

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
    }, [setUser]);

    const navigationTheme = useMemo(() => {
        const baseTheme = mode === 'dark' ? DarkTheme : DefaultTheme;
        return {
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                background: palette.background,
                card: palette.backgroundCard,
                border: palette.border,
                text: palette.text,
                primary: palette.primary,
                notification: palette.secondary,
            },
        };
    }, [mode, palette]);

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: palette.background }]}>
                <ActivityIndicator size="large" color={palette.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={DrawerNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
