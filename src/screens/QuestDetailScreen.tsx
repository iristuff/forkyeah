import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors, FontSize } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function QuestDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { quest } = route.params;
  console.log('quest data:', quest);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <ScrollView>
        <Text style={styles.emoji}>{quest.emoji}</Text>
        <Text style={styles.title}>{quest.name}</Text>
        <Text style={styles.desc}>{quest.description}</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(quest.progress / quest.total) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{quest.progress} of {quest.total} complete</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Reward</Text>
          <Text style={styles.xp}>⭐ {quest.xp_reward} XP</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.midnight },
  back: { padding: 16 },
  backText: { color: '#c45c1a', fontSize: 16, fontWeight: '700' },
  emoji: { fontSize: 64, textAlign: 'center', marginTop: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', marginTop: 8 },
  desc: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', margin: 16 },
  card: { margin: 16, padding: 16, backgroundColor: '#1a0e06', borderRadius: 16, gap: 8 },
  cardLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  progressBar: { height: 8, backgroundColor: '#2a1208', borderRadius: 10 },
  progressFill: { height: 8, backgroundColor: '#c45c1a', borderRadius: 10 },
  progressText: { fontSize: 12, color: Colors.textMuted },
  xp: { fontSize: 24, fontWeight: '800', color: '#c45c1a' },
});