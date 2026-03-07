// ─────────────────────────────────────────────────────────────
// QuestCard.tsx  —  Quest card with animated progress bar
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Quest } from '../types';
import { Colors, Spacing, FontSize, BorderRadius, QuestVariants } from '../constants/theme';
import { QuestProgressBar } from './SharedUI';

interface Props {
  quest: Quest;
  onPress?: () => void;
}

export const QuestCard: React.FC<Props> = ({ quest, onPress }) => {
  const variant = QuestVariants[quest.colorVariant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: variant.background }]}>
        <Text style={styles.icon}>{quest.emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{quest.name}</Text>
        <Text style={styles.desc}>{quest.description}</Text>
        <QuestProgressBar
          progress={quest.progress}
          total={quest.total}
          color={variant.fill}
        />
      </View>

      {/* XP */}
      <Text style={styles.xp}>+{quest.xpReward} XP</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  pressed: { opacity: 0.85 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  info: { flex: 1, gap: 3 },
  name: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  desc: {
    fontSize: 11,
    color: Colors.textDim,
    lineHeight: 15,
    marginBottom: 4,
  },
  xp: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: Colors.gold,
    fontWeight: '700',
  },
});
