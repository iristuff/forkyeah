// ─────────────────────────────────────────────────────────────
// CVScoreCard.tsx  —  CV analysis display (Feed + AI Chat)
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CVScore } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { CVScoreRow } from './SharedUI';

interface Props {
  dishEmoji?: string;
  score: CVScore;
  compact?: boolean; // compact=true used in Feed post cards
}

export const CVScoreCard: React.FC<Props> = ({
  dishEmoji, score, compact = false,
}) => {
  if (compact) {
    // Compact bar-only version shown inside feed posts
    return (
      <View style={styles.compactCard}>
        <Text style={styles.compactTitle}>🤖 CV ANALYSIS</Text>
        <View style={styles.compactGrid}>
          {[
            ['Plating',   score.plating],
            ['Technique', score.technique],
            ['Color',     score.colorBalance],
            ['Portion',   score.portioning],
          ].map(([label, val]) => (
            <View key={label as string} style={styles.compactItem}>
              <Text style={styles.compactLabel}>{label as string}</Text>
              <View style={styles.compactTrack}>
                <View
                  style={[
                    styles.compactFill,
                    { width: `${val as number}%` },
                  ]}
                />
              </View>
              <Text style={styles.compactScore}>{val as number}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Full version used in AI chat
  return (
    <View style={styles.fullCard}>
      <View style={styles.fullHeader}>
        <Text style={styles.fullHeaderIcon}>🤖</Text>
        <Text style={styles.fullHeaderText}>CV DISH ANALYSIS</Text>
      </View>
      <View style={styles.fullBody}>
        {dishEmoji && (
          <Text style={styles.dishEmoji}>{dishEmoji}</Text>
        )}

        <CVScoreRow label="Plating"       score={score.plating}      />
        <CVScoreRow label="Technique"     score={score.technique}    />
        <CVScoreRow label="Color Balance" score={score.colorBalance} />
        <CVScoreRow label="Portioning"    score={score.portioning}   />

        <View style={styles.overallRow}>
          <Text style={styles.overallLabel}>Overall Score</Text>
          <Text style={styles.overallScore}>{score.overall}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact (Feed)
  compactCard: {
    marginHorizontal: 14,
    marginBottom: Spacing.sm + 2,
    backgroundColor: 'rgba(45,158,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45,158,107,0.2)',
    borderRadius: 10,
    padding: Spacing.sm + 2,
  },
  compactTitle: {
    fontSize: 10,
    color: Colors.basil,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  compactGrid: { gap: 4 },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontFamily: 'monospace',
    width: 56,
  },
  compactTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.basil,
  },
  compactScore: {
    fontSize: 9,
    color: Colors.basil,
    fontFamily: 'monospace',
    width: 28,
    textAlign: 'right',
  },

  // Full (AI Chat)
  fullCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(45,158,107,0.25)',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: 6,
  },
  fullHeader: {
    backgroundColor: 'rgba(45,158,107,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm + 2,
  },
  fullHeaderIcon: { fontSize: 14 },
  fullHeaderText: {
    fontSize: 10,
    color: Colors.basil,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  fullBody: { padding: Spacing.md },
  dishEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  overallLabel: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  overallScore: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.basil,
    fontFamily: 'monospace',
  },
});
