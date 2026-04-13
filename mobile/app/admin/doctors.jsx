import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../../services/api';

export default function AdminDoctorsScreen() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/doctors/pending').then(({ data }) => setPending(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleVerify(id, approve) {
    try {
      await api.put(`/admin/doctors/${id}/verify`, { approve });
      setPending(pending.filter((d) => d.id !== id));
      Alert.alert('Succès', approve ? 'Médecin approuvé ✓' : 'Médecin rejeté');
    } catch { Alert.alert('Erreur'); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />
      <View style={{ backgroundColor: '#2db87a', paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Validation médecins</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{pending.length} en attente</Text>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#2db87a" /> : (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>👨‍⚕️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#111' }}>Dr {item.prenom} {item.nom}</Text>
                  <Text style={{ color: '#777', fontSize: 13 }}>{item.specialite}</Text>
                  <Text style={{ color: '#aaa', fontSize: 12 }}>{item.user?.phone}</Text>
                </View>
              </View>
              {item.description && <Text style={{ color: '#555', fontSize: 13, marginBottom: 12 }}>{item.description}</Text>}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => handleVerify(item.id, true)}
                  style={{ flex: 1, backgroundColor: '#22c55e', borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>✓ Valider</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleVerify(item.id, false)}
                  style={{ flex: 1, backgroundColor: '#fee2e2', borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: '#ef4444', fontWeight: '700' }}>✗ Rejeter</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 40 }}>✅</Text>
              <Text style={{ color: '#777', marginTop: 8 }}>Aucun médecin en attente</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
