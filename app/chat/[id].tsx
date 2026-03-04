import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Send, ChevronLeft, Crown } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { useSubscriptionStore } from '@/hooks/useSubscriptionStore';
import { callAPI } from '@/utils/aiService';
import Button from '@/components/Button';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const { isDarkMode } = useThemeStore();
  const { getDocument } = useDocumentStore();
  const { canChat, incrementChatMessages, isPremium } = useSubscriptionStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const document = getDocument(id as string);

  const themeColors = isDarkMode
    ? {
        background: colors.darkBackground,
        text: colors.darkText,
        textLight: colors.darkTextLight,
        card: colors.darkSecondary,
        border: colors.darkBorder,
        input: colors.darkSecondary,
        userBubble: colors.darkPrimary,
        aiBubble: colors.darkSecondary,
      }
    : {
        background: colors.background,
        text: colors.text,
        textLight: colors.textLight,
        card: 'white',
        border: colors.border,
        input: 'white',
        userBubble: colors.primary,
        aiBubble: '#F3F4F6',
      };

  if (!document) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ title: 'Document Not Found' }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: themeColors.text }]}>Document not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (!canChat()) {
      router.push('/paywall');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const apiMessages = [
        {
          role: 'system',
          content: `You are a legal document assistant. The user is asking questions about the following legal document. Answer concisely in plain English. Do not use markdown formatting.

Document Title: ${document.title}
Document Type: ${document.aiAnalysis?.documentType || 'Legal Document'}

Original Text (excerpt):
${document.text.substring(0, 3000)}

Simplified Text:
${document.simplified.substring(0, 2000)}`,
        },
        ...conversationHistory,
        { role: 'user', content: trimmed },
      ];

      const response = await callAPI(apiMessages);
      incrementChatMessages();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Sorry, I could not process your question. Please try again.',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser ? themeColors.userBubble : themeColors.aiBubble,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? 'white' : themeColors.text },
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Ask AI',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={isDarkMode ? colors.darkText : colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Upgrade banner for free users */}
      {!isPremium && (
        <TouchableOpacity
          style={[styles.upgradeBanner, { backgroundColor: isDarkMode ? colors.darkPrimary + '20' : colors.primaryLight + '30' }]}
          onPress={() => router.push('/paywall')}
        >
          <Crown size={16} color={isDarkMode ? colors.darkPrimary : colors.primary} />
          <Text style={[styles.upgradeText, { color: isDarkMode ? colors.darkPrimary : colors.primary }]}>
            Free tier: limited messages per day. Upgrade for unlimited.
          </Text>
        </TouchableOpacity>
      )}

      {/* Document context card */}
      <View style={[styles.contextCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <Text style={[styles.contextTitle, { color: themeColors.text }]} numberOfLines={1}>
          {document.title}
        </Text>
        <Text style={[styles.contextHint, { color: themeColors.textLight }]}>
          Ask any question about this document
        </Text>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: themeColors.textLight }]}>Start a conversation</Text>
          <Text style={[styles.emptyHint, { color: themeColors.textLight }]}>
            Try asking:{'\n'}"What are the key risks?"{'\n'}"When does this expire?"{'\n'}"Can I terminate early?"
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={[styles.inputContainer, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.input, color: themeColors.text, borderColor: themeColors.border }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question..."
            placeholderTextColor={themeColors.textLight}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: isDarkMode ? colors.darkPrimary : colors.primary, opacity: input.trim() && !isLoading ? 1 : 0.5 }]}
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Send size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { padding: 8, marginLeft: -8 },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  upgradeText: { fontSize: 13, fontWeight: '500', flex: 1 },
  contextCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  contextTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  contextHint: { fontSize: 13 },
  messageList: { padding: 16, paddingBottom: 8 },
  messageBubble: { marginBottom: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end' },
  aiBubble: { alignSelf: 'flex-start' },
  bubble: { padding: 12, borderRadius: 16 },
  messageText: { fontSize: 15, lineHeight: 21 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, marginBottom: 20 },
});
