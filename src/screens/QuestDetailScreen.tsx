import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';

const QUEST_STEPS: Record<string, string[]> = {
  'quest_spice_road': [
    '🍛 Cook a chicken curry using at least 5 spices from scratch',
    '🫕 Make a dal using lentils and a homemade tadka',
    '🥘 Prepare a biryani with layered rice and meat or vegetables',
  ],
  'quest_better_together': [
    '👥 Invite a friend to join your cook-along session',
    '🍳 Complete a full recipe together in buddy mode',
  ],
  'quest_ai_critic': [
    '📸 Cook any dish and photograph your plating',
    '🤖 Submit your photo to the AI chef for analysis',
    '🎯 Score 85%+ on technique',
    '🎨 Score 85%+ on colour balance',
    '✅ Achieve an overall score of 90%+',
  ],
};

export default function QuestDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { quest } = route.params;
  const steps = QUEST_STEPS[quest.id] || ['Steps coming soon!'];

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

        <Text style={styles.sectionTitle}>📋 What you need to do</Text>
        {steps.map((step, index) => (
          <View key={index} style={[styles.stepCard, index < quest.progress && styles.stepDone]}>
            <Text style={styles.stepStatus}>{index < quest.progress ? '✅' : '⬜'}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
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
  card: { margin: 16, marginTop: 8, padding: 16, backgroundColor: '#1a0e06', borderRadius: 16, gap: 8 },
  cardLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  progressBar: { height: 8, backgroundColor: '#2a1208', borderRadius: 10 },
  progressFill: { height: 8, backgroundColor: '#c45c1a', borderRadius: 10 },
  progressText: { fontSize: 12, color: Colors.textMuted },
  xp: { fontSize: 24, fontWeight: '800', color: '#c45c1a' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginLeft: 16, marginTop: 8 },
  stepCard: { flexDirection: 'row', margin: 16, marginTop: 8, backgroundColor: '#1a0e06', borderRadius: 12, padding: 14, gap: 12, alignItems: 'center' },
  stepDone: { opacity: 0.5 },
  stepStatus: { fontSize: 20 },
  stepText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 20 },
});