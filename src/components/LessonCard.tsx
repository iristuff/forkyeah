// ─────────────────────────────────────────────────────────────
// LessonCard.tsx  —  Reusable lesson thumbnail card
// Used on HomeScreen
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Lesson } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props {
  lesson: Lesson;
  onPress?: () => void;
}

export const LessonCard: React.FC<Props> = ({ lesson, onPress }) => {
  const pct = lesson.totalSteps > 0
    ? Math.round((lesson.completedSteps / lesson.totalSteps) * 100)
    : 0;

  const progressLabel =
    pct === 100
      ? '✅ Complete'
      : lesson.completedSteps === 0
      ? 'New unlock!'
      : `${lesson.completedSteps} of ${lesson.totalSteps} done`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Thumbnail */}
      <View
        style={[
          styles.thumb,
          { backgroundColor: lesson.gradientStart },
        ]}
      >
        <Text style={styles.emoji}>{lesson.emoji}</Text>
        {/* Flag badge */}
        <Text style={styles.flag}>{lesson.flagEmoji}</Text>
        {/* Progress ring */}
        <View style={styles.progressRing}>
          <Text style={styles.progressRingText}>{pct}%</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{lesson.name}</Text>
        <Text style={styles.meta}>{progressLabel}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.96 }] },
  thumb: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emoji: { fontSize: 36 },
  flag: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    fontSize: 16,
  },
  progressRing: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingText: {
    fontSize: 8,
    color: Colors.gold,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  info: { padding: Spacing.sm + 2 },
  name: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 3,
  },
  meta: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
});
