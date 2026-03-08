import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CURRENT_USER } from '../constants/data';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

const PASSPORT_STAMPS = [
  { flag: '🇯🇵', name: 'Japan',    status: 'done'   },
  { flag: '🇲🇽', name: 'Mexico',   status: 'done'   },
  { flag: '🇮🇹', name: 'Italy',    status: 'done'   },
  { flag: '🇮🇳', name: 'India',    status: 'active' },
  { flag: '🇲🇦', name: 'Morocco',  status: 'locked' },
  { flag: '🇹🇭', name: 'Thailand', status: 'locked' },
  { flag: '🇰🇷', name: 'Korea',    status: 'locked' },
  { flag: '🇬🇭', name: 'Ghana',    status: 'locked' },
];

const FRIENDS = [
  { emoji: '👩‍🍳', name: 'Maria K.',  sub: '🇲🇽 Lv.19 · Cooking Biryani now 🍛', online: true,  action: 'Cook Together' },
  { emoji: '👨‍🍳', name: 'Alex M.',   sub: '🇯🇵 Lv.24 · Leaderboard #2 🏆',       online: true,  action: 'Cook Together' },
  { emoji: '🧑',   name: 'Priya S.',  sub: '🇮🇳 Lv.22 · Last seen 4h ago',         online: false, action: 'Message'       },
];

export default function ProfileScreen() {
  const user = CURRENT_USER;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>{user.emoji}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv. {user.level}</Text>
            </View>
          </View>
          <Text style={styles.name}>Chef {user.name}</Text>
          <Text style={styles.username}>@miaathespicesage · McKinney, TX</Text>
          <View style={styles.personalityPill}>
            <Text style={styles.personalityText}>✨ {user.title} — Bold & Adventurous</Text>
          </View>
          <View style={styles.statsRow}>
            {[
              { value: user.xp.toLocaleString(), label: 'XP TOTAL'   },
              { value: user.streak,              label: 'DAY STREAK' },
              { value: '38',                     label: 'RECIPES'    },
              { value: user.friends.length,      label: 'FRIENDS'    },
            ].map((stat, i) => (
              <View key={i} style={[styles.statItem, i < 3 && styles.statBorder]}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── CHEF PERSONALITY ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR CHEF PERSONALITY</Text>
          <View style={styles.personalityCard}>
            <Text style={styles.personalityCardEmoji}>🧙‍♂️</Text>
            <View style={styles.personalityCardInfo}>
              <Text style={styles.personalityCardName}>The Spice Sage</Text>
              <Text style={styles.personalityCardDesc}>You dive deep into flavor science and cultural roots. Bold with heat, patient with technique. Born for Indian and Moroccan cuisine.</Text>
            </View>
          </View>
        </View>

        {/* ── CULTURAL PASSPORT ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>CULTURAL PASSPORT</Text>
            <Text style={styles.sectionLink}>5 / 12 regions</Text>
          </View>
          <View style={styles.passportGrid}>
            {PASSPORT_STAMPS.map((stamp, i) => (
              <View key={i} style={[
                styles.stamp,
                stamp.status === 'done'   && styles.stampDone,
                stamp.status === 'active' && styles.stampActive,
                stamp.status === 'locked' && styles.stampLocked,
              ]}>
                <Text style={styles.stampFlag}>{stamp.flag}</Text>
                <Text style={styles.stampName}>{stamp.name}</Text>
                <Text style={styles.stampStatus}>
                  {stamp.status === 'done'   ? '✅' :
                   stamp.status === 'active' ? '⚡Active' : '🔒'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── FRIENDS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>FRIENDS ({user.friends.length})</Text>
            <Text style={styles.sectionLink}>+ Add Friend</Text>
          </View>
          {FRIENDS.map((friend, i) => (
            <View key={i} style={styles.friendRow}>
              <View style={styles.friendAvatarWrap}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendEmoji}>{friend.emoji}</Text>
                </View>
                {friend.online && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendSub}>{friend.sub}</Text>
              </View>
              <TouchableOpacity style={[
                styles.friendBtn,
                friend.action === 'Cook Together' && styles.friendBtnCook,
              ]}>
                <Text style={[
                  styles.friendBtnText,
                  friend.action === 'Cook Together' && styles.friendBtnTextCook,
                ]}>{friend.action}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.midnight },

  hero: {
    alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: 'rgba(232,83,42,0.06)', gap: 8,
  },
  avatarWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.surface2,
    borderWidth: 3, borderColor: Colors.spice,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 48 },
  levelBadge: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: Colors.spice, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: BorderRadius.full, borderWidth: 2, borderColor: Colors.midnight,
  },
  levelText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.white },
  name: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text },
  username: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: 'monospace' },
  personalityPill: {
    backgroundColor: 'rgba(168,85,247,0.12)', borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)', borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: 4,
  },
  personalityText: { fontSize: FontSize.sm, color: Colors.purple, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row', width: '100%',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 16, overflow: 'hidden', marginTop: 4,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statBorder: { borderRightWidth: 1, borderRightColor: Colors.border },
  statValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.gold },
  statLabel: { fontSize: 9, color: Colors.textMuted, fontFamily: 'monospace', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  section: { padding: 16, gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 },
  sectionLink: { fontSize: 10, color: Colors.spice, fontFamily: 'monospace', textTransform: 'uppercase' },

  personalityCard: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: 'rgba(168,85,247,0.08)', borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)', borderRadius: 14, padding: 14,
  },
  personalityCardEmoji: { fontSize: 32 },
  personalityCardInfo: { flex: 1, gap: 4 },
  personalityCardName: { fontSize: 15, fontWeight: '800', color: Colors.text },
  personalityCardDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },

  passportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stamp: {
    width: '22%', aspectRatio: 1, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', gap: 2,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  stampDone:   { backgroundColor: Colors.surface },
  stampActive: { borderColor: 'rgba(232,83,42,0.4)' },
  stampLocked: { opacity: 0.35 },
  stampFlag:   { fontSize: 22 },
  stampName:   { fontSize: 9, color: Colors.textMuted, fontFamily: 'monospace', textTransform: 'uppercase' },
  stampStatus: { fontSize: 9, color: Colors.spice },

  friendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, padding: 12,
  },
  friendAvatarWrap: { position: 'relative' },
  friendAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  friendEmoji: { fontSize: 18 },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: '#2D9E6B', borderWidth: 2, borderColor: Colors.midnight,
  },
  friendInfo: { flex: 1, gap: 2 },
  friendName: { fontSize: 14, fontWeight: '800', color: Colors.text },
  friendSub:  { fontSize: 10, color: Colors.textMuted, fontFamily: 'monospace' },
  friendBtn: {
    backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  friendBtnCook: { backgroundColor: 'rgba(232,83,42,0.15)', borderColor: 'rgba(232,83,42,0.3)' },
  friendBtnText: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, fontFamily: 'monospace' },
  friendBtnTextCook: { color: Colors.spice },
});