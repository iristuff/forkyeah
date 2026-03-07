// ─────────────────────────────────────────────────────────────
// screens/HomeScreen.tsx  —  STUB (Dev 2 owns this screen)
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors, FontSize } from '../constants/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.emoji}>🏠</Text>
        <Text style={styles.label}>Home Screen</Text>
        <Text style={styles.sub}>Dev 2 builds this</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.midnight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emoji: { fontSize: 48 },
  label: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  sub:   { fontSize: FontSize.sm, color: Colors.textMuted },
});
