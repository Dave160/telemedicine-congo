import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

const NOTIF_ICONS = {
  APPOINTMENT_CONFIRMED: '✅',
  APPOINTMENT_CANCELLED: '❌',
  PAYMENT_RECEIVED: '💳',
  NEW_MESSAGE: '💬',
  PRESCRIPTION_SENT: '📋',
  SUBSCRIPTION_ACTIVATED: '⭐',
  DEFAULT: '🔔',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    api.get('/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function markRead(id) {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  }

  async function markAllRead() {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#1a73e8' }} />

      {/* Header */}
      <View style={{ backgroundColor: '#1a73e8', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: '#fff', fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 }}>
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={{ color: '#b3d1ff', fontSize: 12, fontWeight: '500' }}>Tout lire</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a73e8" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => markRead(item.id)}
              style={{
                backgroundColor: item.isRead ? '#fff' : '#eff6ff',
                borderRadius: 16,
                padding: 14,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
                elevation: item.isRead ? 1 : 2,
                shadowColor: '#000',
                shadowOpacity: item.isRead ? 0.02 : 0.06,
                shadowRadius: 4,
                borderLeftWidth: item.isRead ? 0 : 3,
                borderLeftColor: '#1a73e8',
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: item.isRead ? '#f3f4f6' : '#e8f0fe', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22 }}>{NOTIF_ICONS[item.type] || NOTIF_ICONS.DEFAULT}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: item.isRead ? '500' : '700', fontSize: 14, color: '#111', marginBottom: 3 }}>{item.title}</Text>
                <Text style={{ color: '#6b7280', fontSize: 13, lineHeight: 18 }}>{item.body}</Text>
                <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
              </View>
              {!item.isRead && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#1a73e8', marginTop: 6 }} />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
              <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Aucune notification</Text>
              <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>
                Vos notifications apparaîtront ici
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
