import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { RootNavigator } from './src/navigation';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from './src/store';
import { themePalettes } from './src/theme';

export default function App() {
  const mode = useThemeStore((state) => state.mode);
  const colors = themePalettes[mode];

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <RootNavigator />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
