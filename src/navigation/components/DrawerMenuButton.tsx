import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Menu } from 'lucide-react-native';
import { spacing, themePalettes } from '../../theme';
import { useThemeStore } from '../../store';

export const DrawerMenuButton: React.FC = () => {
  const navigation = useNavigation();
  const mode = useThemeStore((state) => state.mode);
  const palette = themePalettes[mode];

  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={styles.button}
    >
      <Menu size={24} color={palette.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: spacing.xs,
  },
});

