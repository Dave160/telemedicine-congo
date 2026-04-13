import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />
      <View style={{ backgroundColor: '#2db87a', padding: 20, paddingBottom: 20 }}>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>TéléMéd Congo</Text>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>Tableau de bord</Text>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#2db87a" /> : stats ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            {[
              { label: 'Patients', value: stats.users.patients, icon: '👤', bg: '#eff6ff' },
              { label: 'Médecins vérifiés', value: stats.users.verifiedDoctors, icon: '🩺', bg: '#f0fdf4' },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: s.bg, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                <Text style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#111' }}>{s.value}</Text>
                <Text style={{ color: '#777', fontSize: 12 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            {[
              { label: 'Consultations', value: stats.appointments.total, icon: '📅', bg: '#faf5ff' },
              { label: 'Ce mois', value: stats.appointments.thisMonth, icon: '📆', bg: '#fff7ed' },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: s.bg, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                <Text style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#111' }}>{s.value}</Text>
                <Text style={{ color: '#777', fontSize: 12 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 12 }}>Revenus plateforme</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#777' }}>Total</Text>
              <Text style={{ fontWeight: 'bold', color: '#2db87a' }}>{stats.revenue.total?.toLocaleString()} FCFA</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#777' }}>Ce mois</Text>
              <Text style={{ fontWeight: 'bold', color: '#22c55e' }}>{stats.revenue.thisMonth?.toLocaleString()} FCFA</Text>
            </View>
          </View>

          {stats.users.pendingDoctors > 0 && (
            <TouchableOpacity
              onPress={() => router.push('/admin/doctors')}
              style={{ backgroundColor: '#fffbeb', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#fde68a' }}
            >
              <Text style={{ fontWeight: 'bold', color: '#92400e' }}>⚠️ {stats.users.pendingDoctors} médecin(s) en attente</Text>
              <Text style={{ color: '#b45309', fontSize: 13, marginTop: 2 }}>Cliquer pour valider →</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}
