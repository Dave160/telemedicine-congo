import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function PatientPrescriptionsScreen() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prescriptions/mine')
      .then(({ data }) => setPrescriptions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openPdf(url) {
    if (!url) { Alert.alert('Info', 'PDF non disponible'); return; }
    Linking.openURL(url).catch(() => Alert.alert('Erreur', 'Impossible d\'ouvrir le PDF'));
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#1a73e8' }} />

      {/* Header */}
      <View style={{ backgroundColor: '#1a73e8', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: '#fff', fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 }}>Mes ordonnances</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a73e8" />
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#111' }}>
                    Dr {item.appointment?.doctor?.prenom} {item.appointment?.doctor?.nom}
                  </Text>
                  <Text style={{ color: '#777', fontSize: 12, marginTop: 2 }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                  </Text>
                </View>
                <View style={{ backgroundColor: '#e8f0fe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                  <Text style={{ color: '#1a73e8', fontSize: 11, fontWeight: '600' }}>📄 Ordonnance</Text>
                </View>
              </View>

              <Text style={{ color: '#555', fontSize: 13, lineHeight: 18, marginBottom: 12 }} numberOfLines={3}>
                {item.content}
              </Text>

              {item.pdfUrl && (
                <TouchableOpacity
                  onPress={() => openPdf(item.pdfUrl)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 }}
                >
                  <Text style={{ fontSize: 16 }}>📥</Text>
                  <Text style={{ color: '#16a34a', fontWeight: '600', fontSize: 13 }}>Télécharger le PDF</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>💊</Text>
              <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Aucune ordonnance</Text>
              <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>
                Vos ordonnances apparaîtront ici après vos consultations
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
