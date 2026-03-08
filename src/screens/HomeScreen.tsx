// ─────────────────────────────────────────────────────────────
// screens/HomeScreen.tsx  —  STUB (Dev 2 owns this screen)
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Colors, FontSize } from '../constants/theme';
import { CURRENT_USER, DAILY_MISSION, LESSONS, QUESTS, POSTS } from '../constants/data';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>👋🏻 Hey {CURRENT_USER.name}!</Text>
        <Text style={styles.sub}>Level {CURRENT_USER.level} . 🔥 {CURRENT_USER.streak} day streak</Text>
        <View style={styles.missionCard}>
          <Text style={styles.missionFlag}>{DAILY_MISSION.flagEmoji}</Text>
          <Text style={styles.missionTitle}>{DAILY_MISSION.title}</Text>
          <Text style={styles.missionMeta}>⭐️ {DAILY_MISSION.xpReward} XP . ⏲ {DAILY_MISSION.durationMin} mins . 👤 {DAILY_MISSION.buddyName}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.midnight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emoji: { fontSize: 48 },
  label: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  sub:   { fontSize: FontSize.sm, color: Colors.textMuted },
  missionCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1a0e06',
    borderRadius: 16,
    gap: 6,
  },
  missionFlag: {
    fontSize: 32,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  missionMeta: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
