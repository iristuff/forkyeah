// screens/AIScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Colors, FontSize } from '../constants/theme';
import { sendMessage, Message } from '../services/gemini';

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
        Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
              Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
              Animated.delay(600),
            ])
        ).start();

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
      <View style={styles.row}>
        <Text style={styles.avatar}>🤖</Text>
        <View style={styles.typingBubble}>
          {[dot1, dot2, dot3].map((dot, i) => (
              <Animated.View
                  key={i}
                  style={[styles.dot, { transform: [{ translateY: dot }] }]}
              />
          ))}
        </View>
      </View>
  );
}

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', text: input },
    ];

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendMessage(newMessages);
      setMessages([...newMessages, { role: 'model', text: reply }]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🤖</Text>
          <Text style={styles.title}>Sous Chef AI</Text>
        </View>

        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => (
                  <View style={[styles.row, item.role === 'user' && styles.rowReverse]}>
                    <Text style={styles.avatar}>
                      {item.role === 'user' ? '👤' : '🤖'}
                    </Text>
                    <View style={[
                      styles.bubble,
                      item.role === 'user' ? styles.userBubble : styles.modelBubble
                    ]}>
                      <Text style={[
                        styles.bubbleText,
                        item.role === 'user' ? styles.userText : styles.modelText
                      ]}>
                        {item.text}
                      </Text>
                    </View>
                  </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Ask me anything about cooking!</Text>
              }
              ListFooterComponent={loading ? <TypingIndicator /> : null}
          />

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask Sous Chef..."
                placeholderTextColor={Colors.textMuted}
                onSubmitEditing={handleSend}
                returnKeyType="send"
            />
            <TouchableOpacity
                style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!input.trim()}
            >
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.midnight },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderColor: '#ffffff15' },
  emoji: { fontSize: 24 },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  messageList: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowReverse: { flexDirection: 'row-reverse' },
  avatar: { fontSize: 24, marginBottom: 4 },
  bubble: { padding: 12, borderRadius: 16, maxWidth: '75%' },
  userBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  modelBubble: { backgroundColor: '#ffffff15', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: FontSize.sm, lineHeight: 20 },
  userText: { color: '#fff' },
  modelText: { color: Colors.text },
  emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: 40, fontSize: FontSize.sm },
  typingBubble: { flexDirection: 'row', backgroundColor: '#ffffff15', padding: 12, borderRadius: 16, borderBottomLeftRadius: 4, gap: 4, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderColor: '#ffffff15' },
  input: { flex: 1, backgroundColor: '#ffffff10', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: Colors.text, fontSize: FontSize.sm },
  sendButton: { backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.4 },
  sendText: { color: '#fff', fontWeight: 'bold', fontSize: FontSize.sm },
});