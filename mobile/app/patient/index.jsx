import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

export default function PatientHome() {
  const router = useRouter();
  const { user } = useAuthStore();
  const patient = user?.patient;
  const [availDoctors, setAvailDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/doctors/available-now'),
      api.get('/appointments?status=CONFIRMED&limit=3'),
    ])
      .then(([doc, appt]) => {
        setAvailDoctors(doc.data.slice(0, 3));
        setAppointments(appt.data.appointments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColors = { PENDING: '#fbbf24', CONFIRMED: '#3b82f6', COMPLETED: '#6b7280', CANCELLED: '#ef4444' };
  const statusLabels = { PENDING: 'En attente', CONFIRMED: 'Confirmé', COMPLETED: 'Terminé', CANCELLED: 'Annulé' };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Status bar safe area */}
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ backgroundColor: '#2db87a', padding: 20, paddingBottom: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Bonjour,</Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 2 }}>
                {patient?.prenom || 'Bienvenue'} 👋
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={{ padding: 8 }}>
              <Text style={{ fontSize: 22 }}>🔔</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/patient/doctors')}
            style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, marginTop: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#2db87a', fontWeight: '700', fontSize: 15 }}>Consulter un médecin</Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 16, gap: 20 }}>
          {/* Disponibles maintenant */}
          {availDoctors.length > 0 && (
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 12 }}>⚡ Disponibles maintenant</Text>
              {availDoctors.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  onPress={() => router.push(`/patient/doctor/${doc.id}`)}
                  style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 22 }}>👨‍⚕️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14, color: '#111' }}>Dr {doc.prenom} {doc.nom}</Text>
                    <Text style={{ color: '#777', fontSize: 12 }}>{doc.specialite}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' }} />
                    <Text style={{ color: '#16a34a', fontSize: 11, fontWeight: '600' }}>En ligne</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Prochains RDV */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111' }}>📅 Mes rendez-vous</Text>
              <TouchableOpacity onPress={() => router.push('/patient/appointments')}>
                <Text style={{ color: '#2db87a', fontSize: 13, fontWeight: '500' }}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator color="#2db87a" />
            ) : appointments.length === 0 ? (
              <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📋</Text>
                <Text style={{ color: '#777', fontSize: 13 }}>Aucun rendez-vous à venir</Text>
              </View>
            ) : appointments.map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => router.push(`/appointments/${a.id}`)}
                style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontWeight: '600', fontSize: 14, color: '#111' }}>Dr {a.doctor?.prenom} {a.doctor?.nom}</Text>
                  <View style={{ backgroundColor: statusColors[a.status] + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                    <Text style={{ color: statusColors[a.status], fontSize: 11, fontWeight: '600' }}>{statusLabels[a.status]}</Text>
                  </View>
                </View>
                <Text style={{ color: '#777', fontSize: 12, marginTop: 2 }}>{a.doctor?.specialite}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Grille services */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 12 }}>Services</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {[
                { icon: '📋', label: 'Ordonnances', path: '/patient/prescriptions' },
                { icon: '📰', label: 'Santé', path: '/articles' },
                { icon: '💬', label: 'Messages', path: '/conversations' },
                { icon: '👤', label: 'Mon profil', path: '/patient/profile' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.path}
                  onPress={() => router.push(item.path)}
                  style={{ width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
                >
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</Text>
                  <Text style={{ color: '#444', fontWeight: '500', fontSize: 13 }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
