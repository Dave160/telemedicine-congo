import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

const STATUS_COLORS = { PENDING: '#f59e0b', CONFIRMED: '#3b82f6', COMPLETED: '#6b7280', CANCELLED: '#ef4444' };
const STATUS_LABELS = { PENDING: 'En attente', CONFIRMED: 'Confirmé', COMPLETED: 'Terminé', CANCELLED: 'Annulé' };

export default function DoctorAppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = filter ? `?status=${filter}` : '';
    api.get(`/appointments${p}`)
      .then(({ data }) => setAppointments(data.appointments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  async function confirmAppt(id) {
    try {
      await api.put(`/appointments/${id}/confirm`);
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'CONFIRMED' } : a));
    } catch {
      Alert.alert('Erreur', 'Impossible de confirmer');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />
      <View style={{ backgroundColor: '#2db87a', paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Mes consultations</Text>
      </View>

      <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
        {[{ v: 'PENDING', l: 'En attente' }, { v: 'CONFIRMED', l: 'Confirmés' }, { v: 'COMPLETED', l: 'Terminés' }, { v: '', l: 'Tous' }].map((s) => (
          <TouchableOpacity
            key={s.v}
            onPress={() => setFilter(s.v)}
            style={{ flex: 1, paddingVertical: 6, borderRadius: 20, backgroundColor: filter === s.v ? '#2db87a' : '#fff', borderWidth: 1, borderColor: filter === s.v ? '#2db87a' : '#e5e7eb', alignItems: 'center' }}
          >
            <Text style={{ color: filter === s.v ? '#fff' : '#666', fontSize: 11, fontWeight: '500' }}>{s.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#2db87a" /> : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: '#111' }}>{item.patient?.prenom} {item.patient?.nom}</Text>
                <View style={{ backgroundColor: (STATUS_COLORS[item.status] || '#999') + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                  <Text style={{ color: STATUS_COLORS[item.status] || '#999', fontSize: 11, fontWeight: '600' }}>{STATUS_LABELS[item.status]}</Text>
                </View>
              </View>
              <Text style={{ color: '#777', fontSize: 13 }}>
                {item.type === 'IMMEDIATE' ? '⚡ Immédiat' : item.type === 'SCHEDULED' ? '📅 Planifié' : '🏥 Physique'}
                {item.consultationType ? ` • ${item.consultationType}` : ''}
              </Text>
              {item.status === 'PENDING' && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => confirmAppt(item.id)}
                    style={{ flex: 1, backgroundColor: '#22c55e', borderRadius: 10, paddingVertical: 8, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>✓ Confirmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push(`/appointments/${item.id}`)}
                    style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 10, paddingVertical: 8, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#444', fontWeight: '600', fontSize: 13 }}>Voir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 40 }}>📅</Text>
              <Text style={{ color: '#777', marginTop: 8 }}>Aucune consultation</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
