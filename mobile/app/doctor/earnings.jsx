import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import api from '../../services/api';

export default function DoctorEarningsScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/history')
      .then(({ data }) => setPayments(Array.isArray(data) ? data : data.payments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = payments.filter((p) => p.status === 'COMPLETED');
  const totalEarned = completed.reduce((s, p) => s + (p.doctorAmount || 0), 0);
  const now = new Date();
  const monthlyEarned = completed
    .filter((p) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, p) => s + (p.doctorAmount || 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#1a73e8' }} />
      <View style={{ backgroundColor: '#1a73e8', paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Mes revenus</Text>
      </View>

      {/* Summary */}
      <View style={{ flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 8 }}>
        <View style={{ flex: 1, backgroundColor: '#e8f0fe', borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
          <Text style={{ fontSize: 11, color: '#1a73e8', marginBottom: 4 }}>Ce mois</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1a73e8' }}>{monthlyEarned.toLocaleString()}</Text>
          <Text style={{ fontSize: 10, color: '#93c5fd' }}>FCFA</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
          <Text style={{ fontSize: 11, color: '#16a34a', marginBottom: 4 }}>Total gagné</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#16a34a' }}>{totalEarned.toLocaleString()}</Text>
          <Text style={{ fontSize: 10, color: '#86efac' }}>FCFA</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color="#1a73e8" />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          ListHeaderComponent={
            <Text style={{ fontWeight: '600', color: '#6b7280', fontSize: 13, marginBottom: 10, marginTop: 4 }}>
              Historique ({payments.length})
            </Text>
          }
          renderItem={({ item }) => {
            const isPaid = item.status === 'COMPLETED';
            return (
              <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 14, color: '#111' }}>
                    {item.appointment?.patient?.prenom} {item.appointment?.patient?.nom || 'Patient'}
                  </Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                    {item.method === 'MTN_MONEY' ? '📱 MTN Money' : '📱 Airtel Money'}
                    {item.createdAt ? ` · ${new Date(item.createdAt).toLocaleDateString('fr-FR')}` : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 14, color: isPaid ? '#16a34a' : '#f59e0b' }}>
                    +{(item.doctorAmount || 0).toLocaleString()} FCFA
                  </Text>
                  <Text style={{ fontSize: 10, color: isPaid ? '#86efac' : '#fbbf24', marginTop: 2 }}>
                    {isPaid ? '✓ Reçu' : '⏳ En attente'}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 40 }}>💳</Text>
              <Text style={{ color: '#777', marginTop: 8 }}>Aucune transaction</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
