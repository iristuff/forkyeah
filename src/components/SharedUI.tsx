import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Pressable,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius, PillVariants } from '../constants/theme';

interface XPBarProps {
  current: number;
  max: number;
  label?: string;
  showNumbers?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({ current, max, label, showNumbers = true }) => {
  const animWidth = useRef(new Animated.Value(0)).current;
  const percentage = Math.min(current / max, 1);
  useEffect(() => {
    Animated.timing(animWidth, { toValue: percentage, duration: 1200, useNativeDriver: false }).start();
  }, [percentage]);
  return (
    <View style={styles.xpWrapper}>
      {(label || showNumbers) && (
        <View style={styles.xpRow}>
          {label ? <Text style={styles.xpLabel}>{label}</Text> : <View />}
          {showNumbers && <Text style={styles.xpValue}>{current.toLocaleString()} / {max.toLocaleString()} XP</Text>}
        </View>
      )}
      <View style={styles.xpTrack}>
        <Animated.View style={[styles.xpFill, { width: animWidth.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }) }]} />
      </View>
    </View>
  );
};

interface AvatarProps { emoji: string; size?: number; isOnline?: boolean; style?: ViewStyle; }
export const Avatar: React.FC<AvatarProps> = ({ emoji, size = 36, isOnline = false, style }) => (
  <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}>
    <Text style={{ fontSize: size * 0.55 }}>{emoji}</Text>
    {isOnline && <View style={[styles.onlineDot, { width: size * 0.27, height: size * 0.27, borderRadius: size * 0.135, bottom: 0, right: 0 }]} />}
  </View>
);

type PillVariant = 'spice' | 'gold' | 'basil' | 'teal';
interface PillBadgeProps { label: string; variant?: PillVariant; style?: ViewStyle; }
export const PillBadge: React.FC<PillBadgeProps> = ({ label, variant = 'gold', style }) => {
  const v = PillVariants[variant];
  return (
    <View style={[styles.pill, { backgroundColor: v.background, borderColor: v.border }, style]}>
      <Text style={[styles.pillText, { color: v.color }]}>{label}</Text>
    </View>
  );
};

interface CardProps { children: React.ReactNode; style?: ViewStyle; onPress?: () => void; }
export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  if (onPress) return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, style, pressed && styles.cardPressed]}>{children}</Pressable>
  );
  return <View style={[styles.card, style]}>{children}</View>;
};

interface SectionHeaderProps { title: string; linkLabel?: string; onLink?: () => void; style?: ViewStyle; }
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, linkLabel, onLink, style }) => (
  <View style={[styles.sectionHeader, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {linkLabel && <Pressable onPress={onLink}><Text style={styles.sectionLink}>{linkLabel}</Text></Pressable>}
  </View>
);

interface QuestProgressBarProps { progress: number; total: number; color: string; }
export const QuestProgressBar: React.FC<QuestProgressBarProps> = ({ progress, total, color }) => {
  const animWidth = useRef(new Animated.Value(0)).current;
  const percentage = total > 0 ? Math.min(progress / total, 1) : 0;
  useEffect(() => {
    Animated.timing(animWidth, { toValue: percentage, duration: 900, delay: 200, useNativeDriver: false }).start();
  }, [percentage]);
  return (
    <View>
      <View style={styles.questProgressRow}>
        <Text style={styles.questProgressLabel}>Progress</Text>
        <Text style={styles.questProgressLabel}>{progress}/{total}</Text>
      </View>
      <View style={styles.questTrack}>
        <Animated.View style={[styles.questFill, { backgroundColor: color, width: animWidth.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }) }]} />
      </View>
    </View>
  );
};

interface CVScoreRowProps { label: string; score: number; }
export const CVScoreRow: React.FC<CVScoreRowProps> = ({ label, score }) => {
  const animWidth = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animWidth, { toValue: score / 100, duration: 800, useNativeDriver: false }).start();
  }, [score]);
  return (
    <View style={styles.cvRow}>
      <Text style={styles.cvLabel}>{label}</Text>
      <View style={styles.cvTrack}>
        <Animated.View style={[styles.cvFill, { width: animWidth.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }) }]} />
      </View>
      <Text style={styles.cvScore}>{score}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  xpWrapper: { gap: 6 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabel: { fontSize: FontSize.xs, color: Colors.textDim, fontFamily: 'monospace' },
  xpValue: { fontSize: FontSize.xs, color: Colors.gold, fontFamily: 'monospace', fontWeight: '700' },
  xpTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.basil },
  avatarContainer: { backgroundColor: Colors.surface2, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { position: 'absolute', backgroundColor: Colors.basil, borderWidth: 2, borderColor: Colors.midnight },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1 },
  pillText: { fontSize: 10, fontWeight: '800', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  sectionHeader: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: Colors.textDim, fontFamily: 'monospace' },
  sectionLink: { fontSize: 10, color: Colors.spice, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5 },
  questProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  questProgressLabel: { fontSize: 10, color: Colors.textMuted, fontFamily: 'monospace' },
  questTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' },
  questFill: { height: '100%', borderRadius: 2 },
  cvRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  cvLabel: { fontSize: 11, color: Colors.textDim, width: 90 },
  cvTrack: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' },
  cvFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.basil },
  cvScore: { fontSize: 10, color: Colors.basil, fontFamily: 'monospace', width: 32, textAlign: 'right' },
});