import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function DoctorsScreen() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, [availableOnly]);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (availableOnly) params.set('available', 'true');
      if (search) params.set('search', search);
      const { data } = await api.get(`/doctors?${params}`);
      setDoctors(data.doctors);
    } catch {} finally { setLoading(false); }
  }

  function renderDoctor({ item }) {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/patient/doctor/${item.id}`)}
        style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
      >
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 24 }}>👨‍⚕️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontWeight: '700', fontSize: 15, color: '#111' }}>Dr {item.prenom} {item.nom}</Text>
            {item.isAvailableNow && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' }} />}
          </View>
          <Text style={{ color: '#777', fontSize: 13 }}>{item.specialite}</Text>
          <Text style={{ color: '#2db87a', fontWeight: '700', fontSize: 13, marginTop: 2 }}>{item.tarif?.toLocaleString()} FCFA</Text>
        </View>
        <Text style={{ color: '#ccc', fontSize: 20 }}>›</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />
      <View style={{ backgroundColor: '#2db87a', paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Nos médecins</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            style={{ flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 }}
            placeholder="Rechercher..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchDoctors}
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={() => setAvailableOnly(!availableOnly)}
            style={{ backgroundColor: availableOnly ? '#4ade80' : '#fff', borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 18 }}>⚡</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctor}
        contentContainerStyle={{ padding: 16 }}
        refreshing={loading}
        onRefresh={fetchDoctors}
        ListEmptyComponent={
          !loading ? <View style={{ alignItems: 'center', paddingTop: 40 }}><Text style={{ fontSize: 40 }}>🔍</Text><Text style={{ color: '#777', marginTop: 8 }}>Aucun médecin trouvé</Text></View> : null
        }
      />
    </View>
  );
}
