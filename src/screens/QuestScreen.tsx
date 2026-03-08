import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Colors, FontSize } from '../constants/theme';
import { supabase } from '../constants/supabase';
import { useNavigation } from '@react-navigation/native';
import { QUESTS } from '../constants/data';


export default function QuestScreen() {
    const [quests, setQuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useEffect(() => {
        async function fetchQuests() {
            const { data } = await supabase.from('quests').select('*');
            if (data && data.length > 0) {
                setQuests(data);
            } else{
                setQuests(QUESTS);
            }
            setLoading(false);
        }
        fetchQuests();
    }, []);

    if (loading) return (
        <SafeAreaView style={styles.container}>
            <ActivityIndicator color='#c45c1a' size='large' />
        </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      <ScrollView>
        <Text style={styles.title}>⚔️ Quests</Text>

        <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your Progress</Text>
            <Text style={styles.summaryStats}>🏆 {quests.filter(q => q.progress === q.total).length} completed . ⚔️ {quests.filter(q => q.progress < q.total).length} in progress</Text>
        </View>

        {quests.map(quest => (
            <TouchableOpacity key={quest.id} style={styles.card} onPress={() => navigation.navigate('QuestDetail', {quest})}>
                <View style={styles.cardTop}>
                    <Text style={styles.cardEmoji}>{quest.emoji}</Text>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>{quest.name}</Text>
                        <Text style={styles.cardDesc}>{quest.description}</Text>
                    </View>
                    <Text style={styles.cardXP}>⭐️ {quest.xp_reward}</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${(quest.progress / quest.total) * 100}%`}]} />
                </View>
                <Text style={styles.cardProgress}>{quest.progress} of {quest.total} complete</Text>
            </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.midnight },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, margin: 16 },
  card: { margin: 16, marginTop: 8, backgroundColor: '#1a0e06', borderRadius: 16, padding: 16, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardEmoji: { fontSize: 32 },
  cardInfo: { flex: 1, gap: 4 },
  cardName: { fontSize: 16, fontWeight: '800', color: Colors.text },
  cardDesc: { fontSize: 12, color: Colors.textMuted },
  cardXP: { fontSize: 12, fontWeight: '800', color: '#c45c1a' },
  progressBar: { height: 8, backgroundColor: '#2a1208', borderRadius: 10 },
  progressFill: { height: 8, backgroundColor: '#c45c1a', borderRadius: 10 },
  cardProgress: { fontSize: 11, color: Colors.textMuted },
  summaryCard: { margin: 16, padding: 16, backgroundColor: '#1a0e06', borderRadius: 16, gap: 6 },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  summaryStats: { fontSize: 13, color: Colors.textMuted },
  back: { padding: 16 },
  backText: { color: '#c45c1a', fontSize: 16, fontWeight: '700' },
});