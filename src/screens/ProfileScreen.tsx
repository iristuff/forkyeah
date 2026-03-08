import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CURRENT_USER } from '../constants/data';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';


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
         <Text style={styles.username}>@erikthespicesage · McKinney, TX</Text>
         <View style={styles.personalityPill}>
           <Text style={styles.personalityText}>✨ {user.title} — Bold & Adventurous</Text>
         </View>
       </View>


       {/* ── STATS ROW ── */}
       <View style={styles.statsRow}>
         {[
           { value: user.xp.toLocaleString(), label: 'XP TOTAL' },
           { value: user.streak,              label: 'DAY STREAK' },
           { value: '38',                     label: 'RECIPES' },
           { value: user.friends.length,      label: 'FRIENDS' },
         ].map((stat, i) => (
           <View key={i} style={[styles.statItem, i < 3 && styles.statBorder]}>
             <Text style={styles.statValue}>{stat.value}</Text>
             <Text style={styles.statLabel}>{stat.label}</Text>
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
   alignItems: 'center',
   paddingVertical: Spacing.xl,
   paddingHorizontal: Spacing.lg,
   borderBottomWidth: 1,
   borderBottomColor: Colors.border,
   backgroundColor: 'rgba(232,83,42,0.06)',
 },
 avatarWrap: {
   width: 90,
   height: 90,
   borderRadius: 45,
   backgroundColor: Colors.surface2,
   borderWidth: 3,
   borderColor: Colors.spice,
   alignItems: 'center',
   justifyContent: 'center',
   marginBottom: Spacing.sm,
 },
 avatarEmoji: { fontSize: 48 },
 levelBadge: {
   position: 'absolute',
   bottom: -10,
   backgroundColor: Colors.spice,
   paddingHorizontal: 10,
   paddingVertical: 3,
   borderRadius: BorderRadius.full,
 },
 levelText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.white },
 name: {
   fontSize: FontSize.xxl,
   fontWeight: '900',
   color: Colors.text,
   marginTop: Spacing.md,
 },
 username: {
   fontSize: FontSize.sm,
   color: Colors.textMuted,
   fontFamily: 'monospace',
   marginTop: 4,
 },
 personalityPill: {
   marginTop: Spacing.md,
   backgroundColor: 'rgba(168,85,247,0.15)',
   borderWidth: 1,
   borderColor: 'rgba(168,85,247,0.3)',
   borderRadius: BorderRadius.full,
   paddingHorizontal: Spacing.lg,
   paddingVertical: Spacing.sm,
 },
 personalityText: {
   fontSize: FontSize.sm,
   color: Colors.purple,
   fontWeight: '700',
 },
 statsRow: {
   flexDirection: 'row',
   backgroundColor: Colors.surface,
   borderBottomWidth: 1,
   borderBottomColor: Colors.border,
 },
 statItem: {
   flex: 1,
   alignItems: 'center',
   paddingVertical: Spacing.lg,
 },
 statBorder: {
   borderRightWidth: 1,
   borderRightColor: Colors.border,
 },
 statValue: {
   fontSize: FontSize.xl,
   fontWeight: '900',
   color: Colors.gold,
 },
 statLabel: {
   fontSize: 9,
   color: Colors.textMuted,
   fontFamily: 'monospace',
   marginTop: 3,
   textTransform: 'uppercase',
   letterSpacing: 0.5,
 },
});



