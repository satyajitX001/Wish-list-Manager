import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ShoppingCart, DollarSign } from 'lucide-react-native';
import { themePalettes } from '../theme';
import { AggregatorScreen } from '../features/aggregator';
import { AccountingScreen } from '../features/accounting';
import { useThemeStore } from '../store';

export type TabParamList = {
    Marketplace: undefined;
    Cart: undefined;
    Accounting: undefined;

};

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
    const mode = useThemeStore((state) => state.mode);
    const colors = themePalettes[mode];

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.backgroundCard,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            {/* <Tab.Screen
                name="Marketplace"
                component={MarketplaceScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <ShoppingBag size={size} color={color} />
                    ),
                }}
            /> */}
            <Tab.Screen
                name="Cart"
                component={AggregatorScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <ShoppingCart size={size} color={color} />
                    ),
                    tabBarLabel: 'Unified Cart',
                }}
            />
            <Tab.Screen
                name="Accounting"
                component={AccountingScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <DollarSign size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
