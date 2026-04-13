import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

const STATUS_COLORS = { PENDING: '#f59e0b', CONFIRMED: '#3b82f6', COMPLETED: '#6b7280', CANCELLED: '#ef4444', IN_PROGRESS: '#22c55e' };
const STATUS_LABELS = { PENDING: 'En attente', CONFIRMED: 'Confirmé', COMPLETED: 'Terminé', CANCELLED: 'Annulé', IN_PROGRESS: 'En cours' };

export default function PatientAppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const p = filter ? `?status=${filter}` : '';
    api.get(`/appointments${p}`)
      .then(({ data }) => setAppointments(data.appointments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />
      <View style={{ backgroundColor: '#2db87a', paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Mes consultations</Text>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {[{ v: '', l: 'Tous' }, { v: 'PENDING', l: 'Attente' }, { v: 'CONFIRMED', l: 'Confirmés' }, { v: 'COMPLETED', l: 'Terminés' }].map((s) => (
          <TouchableOpacity
            key={s.v}
            onPress={() => setFilter(s.v)}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: filter === s.v ? '#2db87a' : '#fff', borderWidth: 1, borderColor: filter === s.v ? '#2db87a' : '#e5e7eb' }}
          >
            <Text style={{ color: filter === s.v ? '#fff' : '#666', fontSize: 12, fontWeight: '500' }}>{s.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#2db87a" /> : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/appointments/${item.id}`)}
              style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: '#111' }}>Dr {item.doctor?.prenom} {item.doctor?.nom}</Text>
                <View style={{ backgroundColor: (STATUS_COLORS[item.status] || '#999') + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                  <Text style={{ color: STATUS_COLORS[item.status] || '#999', fontSize: 11, fontWeight: '600' }}>{STATUS_LABELS[item.status]}</Text>
                </View>
              </View>
              <Text style={{ color: '#777', fontSize: 13 }}>{item.doctor?.specialite}</Text>
              {item.scheduledAt && <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>{new Date(item.scheduledAt).toLocaleString('fr-FR')}</Text>}
            </TouchableOpacity>
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
