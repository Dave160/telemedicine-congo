import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

export default function DoctorHome() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const doctor = user?.doctor;
  const [appointments, setAppointments] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments?status=CONFIRMED&limit=5'),
      api.get('/payments/history'),
    ])
      .then(([a, p]) => {
        setAppointments(a.data.appointments);
        const total = p.data.filter((x) => x.status === 'COMPLETED').reduce((s, x) => s + (x.doctorAmount || 0), 0);
        setEarnings(total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleOnline() {
    if (!doctor?.subscriptionActive) {
      Alert.alert('Abonnement requis', 'Activez votre abonnement pour changer de statut');
      router.push('/doctor/subscription');
      return;
    }
    setToggling(true);
    try {
      const { data } = await api.put('/doctors/status/toggle');
      setUser({ ...user, doctor: { ...doctor, isAvailableNow: data.isAvailableNow } });
    } catch {
      Alert.alert('Erreur', 'Impossible de changer le statut');
    } finally {
      setToggling(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#1a73e8' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ backgroundColor: '#1a73e8', padding: 20, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ color: '#b3d1ff', fontSize: 13 }}>Bienvenue,</Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Dr {doctor?.prenom} {doctor?.nom}</Text>
              <Text style={{ color: '#b3d1ff', fontSize: 13 }}>{doctor?.specialite}</Text>
            </View>
            <TouchableOpacity
              onPress={toggleOnline}
              disabled={toggling}
              style={{ backgroundColor: doctor?.isAvailableNow ? '#4ade80' : 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: doctor?.isAvailableNow ? '#fff' : '#9ca3af' }} />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                {toggling ? '...' : doctor?.isAvailableNow ? 'En ligne' : 'Hors ligne'}
              </Text>
            </TouchableOpacity>
          </View>

          {!doctor?.subscriptionActive && (
            <TouchableOpacity
              onPress={() => router.push('/doctor/subscription')}
              style={{ backgroundColor: '#fbbf24', borderRadius: 10, padding: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Text>⚠️</Text>
              <Text style={{ color: '#78350f', fontWeight: '600', fontSize: 13 }}>Activer l'abonnement (20 000 FCFA/mois)</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ padding: 16, gap: 20 }}>
          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[
              { label: 'RDV totaux', value: appointments.length, icon: '📅' },
              { label: 'Gains (FCFA)', value: earnings.toLocaleString(), icon: '💰' },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                <Text style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#111' }}>{s.value}</Text>
                <Text style={{ color: '#777', fontSize: 12 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* RDV à venir */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111' }}>Consultations à venir</Text>
              <TouchableOpacity onPress={() => router.push('/doctor/appointments')}>
                <Text style={{ color: '#1a73e8', fontSize: 13 }}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {loading ? <ActivityIndicator color="#1a73e8" /> : appointments.length === 0 ? (
              <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 32 }}>📅</Text>
                <Text style={{ color: '#777', marginTop: 6, fontSize: 13 }}>Aucune consultation</Text>
              </View>
            ) : appointments.map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => router.push(`/appointments/${a.id}`)}
                style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
              >
                <Text style={{ fontWeight: '600', fontSize: 14, color: '#111' }}>{a.patient?.prenom} {a.patient?.nom}</Text>
                <Text style={{ color: '#777', fontSize: 12 }}>
                  {a.type === 'IMMEDIATE' ? '⚡ Immédiat' : a.type === 'SCHEDULED' ? '📅 Planifié' : '🏥 Physique'}
                  {a.scheduledAt ? ` • ${new Date(a.scheduledAt).toLocaleDateString('fr-FR')}` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
