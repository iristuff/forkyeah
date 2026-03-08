import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors, FontSize } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';

const LESSON_INSTRUCTIONS: Record<string, string[]> = {
  'lesson_spice': [
    '🌶️ Toast whole spices like cumin, coriander, and cardamom in a dry pan for 2 minutes until fragrant.',
    '🔨 Grind the toasted spices using a mortar and pestle or spice grinder.',
    '🧅 Fry onions in oil until golden brown — this is the base of most Indian dishes.',
    '🍅 Add tomatoes and cook until the oil separates from the masala.',
    '✅ Add your ground spice blend and cook for 1 more minute before adding the main ingredient.',
  ],
  'lesson_thai': [
    '🥥 Start with a good quality coconut milk — shake the can before opening.',
    '🍋 Make your curry paste by blending lemongrass, galangal, kaffir lime, and chillies.',
    '🔥 Fry the curry paste in a wok until fragrant, about 3 minutes.',
    '🥛 Add coconut milk gradually, stirring constantly to avoid splitting.',
    '🌿 Finish with fresh Thai basil and a squeeze of lime juice.',
    '✅ Taste and balance sweet, sour, salty and spicy before serving.',
  ],
  'lesson_tagine': [
    '🫒 Heat olive oil in the tagine base and brown the meat on all sides.',
    '🧅 Add onions, garlic, and ginger and cook until softened.',
    '🌶️ Add spices — ras el hanout, cumin, cinnamon, and saffron.',
    '🍋 Add preserved lemon and olives for authentic Moroccan flavour.',
    '💧 Add a little water, cover with the cone lid and cook on low heat for 1.5 hours.',
  ],
  'lesson_bento': [
    '🍚 Cook short grain Japanese rice and season with rice vinegar, sugar and salt.',
    '🥢 Prepare your protein — tamagoyaki egg, teriyaki chicken, or salmon.',
    '🥦 Blanch vegetables like broccoli and edamame in salted water.',
    '🎨 Arrange everything in the bento box by colour — aim for 5 different colours.',
    '✅ Add dividers between wet and dry items to keep everything fresh.',
  ],
};

export default function LessonDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { lesson } = route.params;
  const instructions = LESSON_INSTRUCTIONS[lesson.id] || ['Instructions coming soon!'];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <ScrollView>
        <Text style={styles.emoji}>{lesson.emoji}</Text>
        <Text style={styles.title}>{lesson.name}</Text>
        <Text style={styles.cuisine}>{lesson.flagEmoji} {lesson.cuisine}</Text>
        <View style={styles.progressCard}>
          <Text style={styles.cardLabel}>Your Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(lesson.completedSteps / lesson.totalSteps) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{lesson.completedSteps} of {lesson.totalSteps} steps complete</Text>
        </View>
        <Text style={styles.sectionTitle}>📋 Instructions</Text>
        {instructions.map((step, index) => (
          <View key={index} style={styles.stepCard}>
            <Text style={styles.stepNumber}>Step {index + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.midnight },
  back: { padding: 16 },
  backText: { color: '#c45c1a', fontSize: 16, fontWeight: '700' },
  emoji: { fontSize: 64, textAlign: 'center', marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', marginTop: 8 },
  cuisine: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
  progressCard: { margin: 16, padding: 16, backgroundColor: '#1a0e06', borderRadius: 16, gap: 8 },
  cardLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  progressBar: { height: 8, backgroundColor: '#2a1208', borderRadius: 10 },
  progressFill: { height: 8, backgroundColor: '#c45c1a', borderRadius: 10 },
  progressText: { fontSize: 12, color: Colors.textMuted },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginLeft: 16, marginTop: 8 },
  stepCard: { margin: 16, marginTop: 8, backgroundColor: '#1a0e06', borderRadius: 12, padding: 16, gap: 6 },
  stepNumber: { fontSize: 11, color: '#c45c1a', fontWeight: '800', textTransform: 'uppercase' },
  stepText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
});