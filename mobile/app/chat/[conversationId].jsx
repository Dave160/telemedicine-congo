import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export default function ChatScreen() {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    loadMessages();
    setupSocket();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [conversationId]);

  async function loadMessages() {
    try {
      const { data } = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(data);
      markRead();
    } catch {} finally {
      setLoading(false);
    }
  }

  async function setupSocket() {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_conversation', conversationId);
    });

    socket.on('new_message', (message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      markRead();
    });

    socket.on('user_typing', ({ userId }) => {
      if (userId !== user?.id) {
        setTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(false), 2000);
      }
    });
  }

  async function markRead() {
    try { await api.put(`/conversations/${conversationId}/read`); } catch {}
  }

  function emitTyping() {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { conversationId });
    }
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content) return;
    setSending(true);
    setInput('');
    try {
      const { data } = await api.post(`/conversations/${conversationId}/messages`, { content, type: 'TEXT' });
      setMessages((prev) => [...prev, data]);
    } catch {
      Alert.alert('Erreur', 'Message non envoyé');
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  function renderMessage({ item }) {
    const isMe = item.senderId === user?.id;
    return (
      <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
        <View style={{
          maxWidth: '78%',
          backgroundColor: isMe ? '#2db87a' : '#fff',
          borderRadius: 18,
          borderBottomRightRadius: isMe ? 4 : 18,
          borderBottomLeftRadius: isMe ? 18 : 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
          elevation: isMe ? 0 : 1,
          shadowColor: '#000',
          shadowOpacity: isMe ? 0 : 0.06,
          shadowRadius: 4,
        }}>
          <Text style={{ color: isMe ? '#fff' : '#111', fontSize: 14, lineHeight: 20 }}>{item.content}</Text>
          <Text style={{ color: isMe ? 'rgba(255,255,255,0.6)' : '#aaa', fontSize: 10, marginTop: 4, textAlign: 'right' }}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
            {isMe && item.isRead ? ' ✓✓' : isMe ? ' ✓' : ''}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />

      {/* Header */}
      <View style={{ backgroundColor: '#2db87a', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: '#fff', fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18 }}>💬</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Consultation</Text>
          {typing && <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>en train d'écrire...</Text>}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2db87a" />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 14, paddingBottom: 8 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>💬</Text>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>Démarrez la conversation</Text>
            </View>
          }
        />
      )}

      {/* Input bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
          <TextInput
            style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 }}
            placeholder="Écrivez un message..."
            value={input}
            onChangeText={(v) => { setInput(v); emitTyping(); }}
            multiline
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={sending || !input.trim()}
            style={{
              width: 44, height: 44,
              borderRadius: 22,
              backgroundColor: input.trim() ? '#2db87a' : '#e5e7eb',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {sending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={{ fontSize: 18, color: input.trim() ? '#fff' : '#9ca3af' }}>➤</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
