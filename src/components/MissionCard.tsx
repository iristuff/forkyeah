// ─────────────────────────────────────────────────────────────
// MissionCard.tsx  —  Daily mission card with flame pulse animation
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import type { DailyMission } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { PillBadge } from './SharedUI';

interface Props {
  mission: DailyMission;
  onPress?: () => void;
}

export const MissionCard: React.FC<Props> = ({ mission, onPress }) => {
  // Flame pulse animation
  const flameAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(flameAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Tag row */}
      <View style={styles.tagRow}>
        <Animated.Text style={[styles.flame, { transform: [{ scale: flameAnim }] }]}>
          🔥
        </Animated.Text>
        <Text style={styles.tag}>
          Daily Drop{mission.buddyAvailable ? ' • Buddy Mode Available' : ''}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{mission.title}</Text>

      {/* Meta */}
      <View style={styles.metaRow}>
        <PillBadge label={`+${mission.xpReward} XP`} variant="gold" />
        <PillBadge label={`${mission.flagEmoji} ${mission.cuisine}`} variant="basil" />
        <Text style={styles.time}>⏱ {mission.durationMin} min</Text>
      </View>

      {/* Arrow */}
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(232,83,42,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,83,42,0.35)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    position: 'relative',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  flame: { fontSize: 16 },
  tag: {
    fontSize: 10,
    color: Colors.spice,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  title: {
    fontFamily: 'serif',
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  time: {
    fontSize: 10,
    color: Colors.textDim,
    fontFamily: 'monospace',
  },
  arrow: {
    position: 'absolute',
    right: Spacing.lg,
    top: '50%',
    fontSize: 20,
    color: Colors.spice,
  },
});
