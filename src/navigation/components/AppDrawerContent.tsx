import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Switch,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { spacing, fontSize, fontWeight, borderRadius, themePalettes } from '../../theme';
import { useAuthStore, useThemeStore } from '../../store';

const getInitials = (fullName?: string, email?: string, phone?: string): string => {
  const source = (fullName || '').trim() || (email || '').trim() || (phone || '').trim();
  if (!source) return 'U';
  const chunks = source.split(/\s+/).filter(Boolean);
  if (chunks.length >= 2) {
    return `${chunks[0][0] || ''}${chunks[1][0] || ''}`.toUpperCase();
  }
  return (source.slice(0, 2) || 'U').toUpperCase();
};

export const AppDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const user = useAuthStore((state) => state.user);
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const palette = themePalettes[mode];
  const styles = getStyles(palette);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.content}>
        <View>
          <View style={styles.profileCard}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {getInitials(user?.displayName, user?.email, user?.phoneNumber)}
                </Text>
              </View>
            )}

            <Text style={styles.nameText}>
              {user?.displayName || 'User'}
            </Text>
            <Text style={styles.detailText}>
              {user?.phoneNumber || 'No phone number'}
            </Text>
            <Text style={styles.detailText}>
              {user?.email || 'No email'}
            </Text>
          </View>

          <View style={styles.drawerItems}>
            <DrawerItemList {...props} />
          </View>
        </View>

        <View style={styles.themeToggleRow}>
          <Text style={styles.themeToggleLabel}>
            {mode === 'dark' ? 'Dark mode' : 'Light mode'}
          </Text>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleMode}
            thumbColor={palette.white}
            trackColor={{ false: palette.borderLight, true: palette.primary }}
          />
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const getStyles = (palette: typeof themePalettes.dark) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      backgroundColor: palette.backgroundCard,
    },
    content: {
      flex: 1,
      justifyContent: 'space-between',
    },
    profileCard: {
      margin: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.background,
      alignItems: 'center',
      gap: spacing.xs,
    },
    avatarImage: {
      width: 72,
      height: 72,
      borderRadius: 36,
      marginBottom: spacing.sm,
    },
    avatarFallback: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: palette.primary,
      marginBottom: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarFallbackText: {
      color: palette.white,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
    },
    nameText: {
      color: palette.text,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
    },
    detailText: {
      color: palette.textMuted,
      fontSize: fontSize.sm,
    },
    drawerItems: {
      marginTop: spacing.sm,
    },
    themeToggleRow: {
      margin: spacing.md,
      marginTop: spacing.lg,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    themeToggleLabel: {
      color: palette.text,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
    },
  });

