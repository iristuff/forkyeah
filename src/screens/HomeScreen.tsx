import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors, FontSize } from '../constants/theme';
import { CURRENT_USER, DAILY_MISSION, LESSONS, QUESTS, POSTS } from '../constants/data';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>Hey {CURRENT_USER.name}!</Text>
        <Text style={styles.sub}>Level {CURRENT_USER.level} . 🔥 {CURRENT_USER.streak} day streak</Text>
        <View style={styles.missionCard}>
          <Text style={styles.missionFlag}>{DAILY_MISSION.flagEmoji}</Text>
          <Text style={styles.missionTitle}>{DAILY_MISSION.title}</Text>
          <Text style={styles.missionMeta}>⭐️ {DAILY_MISSION.xpReward} XP . ⏲ {DAILY_MISSION.durationMin} mins . 👤 {DAILY_MISSION.buddyName}</Text>
        </View>
        <Text style={styles.sectionTitle}>📚 Lessons</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {LESSONS.map(lesson => (
            <TouchableOpacity key={lesson.id} style={styles.lessonCard} onPress={() => navigation.navigate('LessonDetail', { lesson})}>
              <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
              <Text style={styles.lessonName}>{lesson.name}</Text>
              <Text style={styles.lessonProgress}>{lesson.completedSteps}/{lesson.totalSteps} steps</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.questsButton} onPress={() => navigation.navigate('Quests')}>
          <Text style={styles.questsButtonText}>⚔️ Quests</Text>
          <Text style={styles.questsButtonArrow}>See all →</Text>
        </TouchableOpacity>
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
  sub: { fontSize: FontSize.sm, color: Colors.textMuted },
});
