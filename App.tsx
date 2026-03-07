// ─────────────────────────────────────────────────────────────
// App.tsx  —  Saffron root entry point
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      {/*
        style="dark" = white clock/battery icons on the dark header
        backgroundColor matches our app background
      */}
      <StatusBar style="light" backgroundColor="#0E0E16" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
