// ─────────────────────────────────────────────────────────────
// FeedPost.tsx  —  Full social post card (Dev3 uses this)
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Post } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Avatar } from './SharedUI';
import { CVScoreCard } from './CVScoreCard';

interface Props {
  post: Post;
  onLike?: (postId: string) => void;
}

export const FeedPost: React.FC<Props> = ({ post, onLike }) => {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(c => c + (newLiked ? 1 : -1));
    onLike?.(post.id);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar emoji={post.userEmoji} size={38} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.userSub}>
            Lv.{post.userLevel} • {post.flagEmoji} {post.cuisine}
          </Text>
        </View>
        <Text style={styles.time}>{post.timeAgo}</Text>
      </View>

      {/* Media placeholder */}
      <View style={styles.media}>
        <Text style={styles.dishEmoji}>{post.dishEmoji}</Text>
        <View style={styles.mediaOverlay}>
          <Text style={styles.dishName}>{post.dishName}</Text>
          <Text style={styles.cultureLine}>{post.flagEmoji} {post.cuisine} Cuisine</Text>
        </View>
      </View>

      {/* CV Score */}
      <CVScoreCard score={post.cvScore} compact />

      {/* Caption */}
      <Text style={styles.caption}>{post.caption}</Text>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable onPress={handleLike} style={styles.action}>
          <Text style={[styles.actionIcon, liked && styles.likedIcon]}>
            {liked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, liked && styles.likedText]}>
            {likeCount}
          </Text>
        </Pressable>

        <View style={styles.action}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{post.comments}</Text>
        </View>

        <View style={styles.action}>
          <Text style={styles.actionIcon}>🔁</Text>
          <Text style={styles.actionText}>Share</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  header: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  userSub: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  time: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  media: {
    height: 180,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dishEmoji: { fontSize: 72 },
  mediaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dishName: {
    fontFamily: 'serif',
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: Colors.white,
  },
  cultureLine: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'monospace',
  },
  caption: {
    fontSize: FontSize.sm,
    color: Colors.textDim,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'center',
    padding: Spacing.sm + 2,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionIcon: { fontSize: FontSize.md },
  actionText: {
    fontSize: FontSize.sm,
    color: Colors.textDim,
  },
  likedIcon: {},
  likedText: { color: Colors.spice },
});
