import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function DoctorPatientsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/appointments?status=COMPLETED')
      .then(({ data }) => setAppointments(data.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Deduplicate patients
  const patientMap = new Map();
  appointments.forEach((a) => {
    if (a.patient) {
      const key = a.patient.id || a.patient.userId;
      if (!patientMap.has(key)) {
        patientMap.set(key, { ...a.patient, lastAppointment: a, consultCount: 1 });
      } else {
        patientMap.get(key).consultCount += 1;
      }
    }
  });
  const patients = Array.from(patientMap.values()).filter((p) => {
    const name = `${p.prenom || ''} ${p.nom || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#1a73e8' }} />
      <View style={{ backgroundColor: '#1a73e8', paddingHorizontal: 16, paddingBottom: 14 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Mes patients</Text>
        <TextInput
          style={{ backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 }}
          placeholder="🔍 Rechercher..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a73e8" />
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id || item.userId}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22 }}>{item.sexe === 'F' ? '👩' : '👤'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', fontSize: 15, color: '#111' }}>{item.prenom} {item.nom}</Text>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                  {item.consultCount} consultation{item.consultCount > 1 ? 's' : ''}
                </Text>
              </View>
              {item.lastAppointment?.conversation?.id && (
                <TouchableOpacity
                  onPress={() => router.push(`/chat/${item.lastAppointment.conversation.id}`)}
                  style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#e8f0fe', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 18 }}>💬</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>👥</Text>
              <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Aucun patient</Text>
              <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>
                Vos patients apparaîtront après vos consultations
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
