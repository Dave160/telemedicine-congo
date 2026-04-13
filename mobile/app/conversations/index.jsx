import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

export default function ConversationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/conversations')
      .then(({ data }) => setConversations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function getOtherName(conv) {
    if (user?.role === 'DOCTOR') {
      return `${conv.patient?.prenom || ''} ${conv.patient?.nom || ''}`.trim() || 'Patient';
    }
    return `Dr ${conv.doctor?.prenom || ''} ${conv.doctor?.nom || ''}`.trim();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />

      {/* Header */}
      <View style={{ backgroundColor: '#2db87a', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: '#fff', fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 }}>Messages</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2db87a" />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const lastMsg = item.messages?.[item.messages.length - 1];
            const unread = item.messages?.filter((m) => !m.isRead && m.senderId !== user?.id).length || 0;
            return (
              <TouchableOpacity
                onPress={() => router.push(`/chat/${item.id}`)}
                style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 22 }}>{user?.role === 'DOCTOR' ? '👤' : '👨‍⚕️'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: unread > 0 ? '700' : '600', fontSize: 14, color: '#111' }}>{getOtherName(item)}</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {lastMsg?.content || 'Démarrer la conversation'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {lastMsg?.createdAt && (
                    <Text style={{ color: '#9ca3af', fontSize: 10 }}>
                      {new Date(lastMsg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                  {unread > 0 && (
                    <View style={{ backgroundColor: '#2db87a', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{unread}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
              <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Aucun message</Text>
              <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>
                Vos conversations apparaîtront après vos consultations
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
