// ─────────────────────────────────────────────────────────────
// screens/HomeScreen.tsx  —  STUB (Dev 2 owns this screen)
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Colors, FontSize } from '../constants/theme';
import { CURRENT_USER, DAILY_MISSION, LESSONS, QUESTS, POSTS } from '../constants/data';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
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
        <Text style={styles.sectionTitle}>📚 Lessons</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {LESSONS.map(lesson => (
            <View key={lesson.id} style={styles.lessonCard}>
              <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
              <Text style={styles.lessonName}>{lesson.name}</Text>
              <Text style={styles.lessonProgress}>{lesson.completedSteps}/{lesson.totalSteps} steps</Text>
            </View>
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle} onPress={() => navigation.navigate('Quests')}>⚔️ Quests</Text>
        {QUESTS.map(quest => (
          <View key={quest.id} style={styles.questCard}>
            <Text style={styles.questEmoji}>{quest.emoji}</Text>
            <View style={styles.questInfo}>
              <Text style={styles.questName}>{quest.name}</Text>
              <Text style={styles.questDesc}>{quest.description}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(quest.progress / quest.total) * 100}%`}]} />
              </View>
              <Text style={styles.questMeta}>{quest.progress}/{quest.total} . ⭐️ {quest.xpReward} XP</Text>
            </View>
          </View>
        ))}
        <Text style={styles.sectionTitle}>🍽️ Community Feed</Text>
        {POSTS.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Text style={styles.postAvatar}>{post.userEmoji}</Text>
              <View>
                <Text style={styles.postName}>{post.userName}</Text>
                <Text style={styles.postMeta}>{post.flagEmoji} . {post.timeAgo}</Text>
              </View>
            </View>
            <Text style={styles.postDish}>{post.dishEmoji} {post.dishName}</Text>
            <Text style={styles.postCaption}>{post.caption}</Text>
            <Text style={styles.postActions}>❤️ {post.likes} 💬 {post.comments}</Text>
          </View>
        ))}
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

  sectionTitle: { fontSize:18, fontWeight: '800', color: Colors.text, marginLeft: 16, marginTop: 16 },
  lessonCard: { margin: 8, padding: 16, backgroundColor: '#1a0e06', borderRadius: 12, width: 130, gap: 4 },
  lessonEmoji: { fontSize: 28 },
  lessonName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  lessonProgress: { fontSize: 11, color: Colors.textMuted },

  questCard: { flexDirection: 'row', margin: 16, marginTop: 8, backgroundColor: '#1a0e06', borderRadius: 12, padding: 14, gap: 12 },
  questEmoji: { fontSize: 28 },
  questInfo: { flex: 1, gap: 4 },
  questName: { fontSize: 14, fontWeight: '800', color: Colors.text },
  questDesc: { fontSize: 11, color: Colors.textMuted },
  progressBar: { height: 6, backgroundColor: '#2a1208', borderRadius: 10 },
  progressFill: { height: 6, backgroundColor: '#c45c1a', borderRadius: 10 },
  questMeta: { fontSize: 10, color: Colors.textMuted },

  postCard: { margin: 16, marginTop: 8, backgroundColor: '#1a0e06', borderRadius: 12, padding: 14, gap: 8 },
  postHeader: {flexDirection: 'row', alignItems:'center', gap: 10 },
  postAvatar: { fontSize: 28 },
  postName: { fontSize: 13, fontWeight:'800', color: Colors.text },
  postMeta: { fontSize: 11, color: Colors.textMuted },
  postDish: { fontSize: 18, fontWeight:'800', color: Colors.text },
  postCaption: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  postActions: { fontSize: 13, color: Colors.textMuted },
});
