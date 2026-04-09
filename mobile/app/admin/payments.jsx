import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import api from '../../services/api';

const STATUS_COLORS = { COMPLETED: '#22c55e', PENDING: '#f59e0b', FAILED: '#ef4444' };
const STATUS_LABELS = { COMPLETED: 'Réussi', PENDING: 'En attente', FAILED: 'Échoué' };

export default function AdminPaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/payments')
      .then(({ data }) => setPayments(data.payments || data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = payments.filter((p) => p.status === 'COMPLETED');
  const totalRevenue = completed.reduce((s, p) => s + (p.amount || 0), 0);
  const totalFees = completed.reduce((s, p) => s + (p.platformFee || 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#1a73e8' }} />
      <View style={{ backgroundColor: '#1a73e8', paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Paiements</Text>
      </View>

      {/* Summary */}
      <View style={{ flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 0 }}>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>Volume total</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111' }}>{totalRevenue.toLocaleString()}</Text>
          <Text style={{ fontSize: 11, color: '#aaa' }}>FCFA</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#e8f0fe', borderRadius: 16, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#1a73e8', marginBottom: 4 }}>Commission</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a73e8' }}>{totalFees.toLocaleString()}</Text>
          <Text style={{ fontSize: 11, color: '#93c5fd' }}>FCFA</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a73e8" />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const color = STATUS_COLORS[item.status] || '#9ca3af';
            return (
              <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14, color: '#111' }} numberOfLines={1}>
                      {item.appointment?.patient?.prenom} {item.appointment?.patient?.nom || 'Patient'} → Dr {item.appointment?.doctor?.prenom} {item.appointment?.doctor?.nom || ''}
                    </Text>
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                      {item.method === 'MTN_MONEY' ? '📱 MTN Money' : '📱 Airtel Money'}
                      {item.createdAt ? ` · ${new Date(item.createdAt).toLocaleDateString('fr-FR')}` : ''}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: color + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginLeft: 8 }}>
                    <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{STATUS_LABELS[item.status] || item.status}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 }}>
                  <Text style={{ fontSize: 12, color: '#555' }}>Total : <Text style={{ fontWeight: '700', color: '#111' }}>{(item.amount || 0).toLocaleString()} FCFA</Text></Text>
                  <Text style={{ fontSize: 12, color: '#555' }}>Comm. : <Text style={{ fontWeight: '700', color: '#1a73e8' }}>{(item.platformFee || 0).toLocaleString()} FCFA</Text></Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 40 }}>💳</Text>
              <Text style={{ color: '#777', marginTop: 8 }}>Aucun paiement</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
