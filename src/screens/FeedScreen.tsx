// screens/FeedScreen.tsx  

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StyleSheet,
} from 'react-native';
import type { Post } from '../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { Avatar } from '../components/SharedUI';
import { POSTS } from '../constants/data';
import { CVScoreCard } from '../components/CVScoreCard';

const FILTERS = ['All', 'Friends', '🇯🇵 Japanese', '🇮🇳 Indian', '🇮🇹 Italian', '🇲🇽 Mexican', '🇹🇭 Thai'];

  // export default function FeedScreen() {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <View style={styles.center}>
  //         <Text style={styles.emoji}>🌍</Text>
  //         <Text style={styles.label}>World Feed</Text>
  //         <Text style={styles.sub}>Dev 3 builds this</Text>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

export default function FeedScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>(
    POSTS.reduce((acc, p) => ({ ...acc, [p.id]: p.liked }), {})
  );

  const toggleLike = (id: string) =>
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>World <Text style={styles.titleAccent}>Feed</Text> 🌍</Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 20 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts */}
      {POSTS.map(post => (
        <View key={post.id} style={styles.post}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <Avatar emoji={post.userEmoji} size={38} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.postName}>{post.userName}</Text>
                <View style={styles.lvBadge}>
                  <Text style={styles.lvText}>Lv.{post.userLevel}</Text>
                </View>
              </View>
              <Text style={styles.postSub}>{post.cuisine}</Text>
            </View>
            <Text style={styles.postTime}>{post.timeAgo}</Text>
          </View>



          {/* Media */}
          <View style={styles.postMedia}>
            <Image
              source={{ uri: post.imageUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <View style={styles.mediaOverlay}>
              <Text style={styles.dishName}>{post.dishName}</Text>
              <Text style={styles.dishCulture}>{post.cuisine}</Text>
            </View>
          </View>

          {/* CV Analysis */}
          <CVScoreCard score={post.cvScore} compact={true} />
          {/* <View style={styles.cvBox}>
            <Text style={styles.cvTitle}>🤖 AI Vision Analysis</Text>
            <View style={styles.cvScoresRow}>
              {post.cvScore.map((s, i) => (
                <View key={i} style={styles.cvScoreCol}>
                  <Text style={styles.cvScoreLabel}>{s.label}</Text>
                  <View style={styles.cvScoreTrack}>
                    <View style={[styles.cvScoreFill, { width: `${s.score}%` as any, backgroundColor: s.color }]} />
                  </View>
                  <Text style={[styles.cvScoreNum, { color: s.color }]}>{s.score}%</Text>
                </View>
              ))}
            </View>
          </View> */}

          {/* Caption */}
          <Text style={styles.caption}>{post.caption}</Text>

          {/* Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.action} onPress={() => toggleLike(post.id)}>
              <Text style={[styles.actionText, likedPosts[post.id] && { color: Colors.spice }]}>
                {likedPosts[post.id] ? '❤️' : '🤍'} {post.likes + (likedPosts[post.id] && !post.liked ? 1 : post.liked && !likedPosts[post.id] ? -1 : 0)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action}>
              <Text style={styles.actionText}>💬 {post.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action}>
              <Text style={styles.actionText}>🔖 Save</Text>
            </TouchableOpacity>
            <Text style={{ marginLeft: 'auto', fontSize: 18 }}>🔥</Text>
          </View>
        </View>
      ))}

      <View style={{ height: 16 }} />
    </ScrollView>
  );
}


// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.midnight },
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
//   emoji: { fontSize: 48 },
//   label: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
//   sub:   { fontSize: FontSize.sm, color: Colors.textMuted },
// });

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.midnight },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text },
  titleAccent: { color: Colors.saffron, fontStyle: 'italic' },

  filterRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: { backgroundColor: Colors.spice, borderColor: Colors.spice },
  filterText: { fontSize: 11, fontWeight: '800', color: Colors.textDim },
  filterTextActive: { color: '#fff' },

  post: {
    marginHorizontal: Spacing.lg, marginBottom: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, overflow: 'hidden',
  },
  postHeader: { padding: 14, flexDirection: 'row', alignItems: 'center' },
  postName: { fontSize: 14, fontWeight: '800', color: Colors.text },
  lvBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.full, borderWidth: 1 },
  lvText: { fontSize: 9, fontWeight: '800' },
  postSub: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  postTime: { fontSize: 10, color: Colors.textMuted },

  postImage: {
    width: '100%',
    height: 200,
  },

  postMedia: {
    height: 200, backgroundColor: Colors.surface2,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  mediaOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dishName: { fontSize: 18, fontWeight: '900', color: '#fff' },
  dishCulture: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  cvBox: {
    margin: 14,
    backgroundColor: 'rgba(45,158,107,0.08)',
    borderWidth: 1, borderColor: 'rgba(45,158,107,0.2)',
    borderRadius: 10, padding: 10,
  },
  cvTitle: { fontSize: 10, color: Colors.basil, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  cvScoresRow: { flexDirection: 'row', gap: 10 },
  cvScoreCol: { flex: 1 },
  cvScoreLabel: { fontSize: 9, color: Colors.textMuted, marginBottom: 4, fontWeight: '600' },
  cvScoreTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', marginBottom: 2 },
  cvScoreFill: { height: '100%', borderRadius: 2 },
  cvScoreNum: { fontSize: 9, fontWeight: '700', textAlign: 'right' },

  caption: { paddingHorizontal: 14, paddingBottom: 10, fontSize: 13, color: Colors.textDim, lineHeight: 19 },
  postActions: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingTop: 10, gap: 16,
  },
  action: {},
  actionText: { fontSize: 13, color: Colors.textDim, fontWeight: '600' },
});
