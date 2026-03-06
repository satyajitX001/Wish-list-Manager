import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TabNavigator } from './TabNavigator';
import { AppDrawerContent } from './components/AppDrawerContent';
import { useThemeStore } from '../store';
import { themePalettes } from '../theme';

export type DrawerParamList = {
  Home: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator: React.FC = () => {
  const mode = useThemeStore((state) => state.mode);
  const palette = themePalettes[mode];

  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        swipeEdgeWidth: 60,
        drawerStyle: {
          width: 300,
          backgroundColor: palette.backgroundCard,
          borderRightWidth: 1,
          borderRightColor: palette.border,
        },
        drawerActiveTintColor: palette.primary,
        drawerInactiveTintColor: palette.textMuted,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{ drawerLabel: 'Dashboard' }}
      />
    </Drawer.Navigator>
  );
};

