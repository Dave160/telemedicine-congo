import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const STATUS_COLORS = { PENDING: '#f59e0b', CONFIRMED: '#3b82f6', COMPLETED: '#6b7280', CANCELLED: '#ef4444', IN_PROGRESS: '#22c55e' };
const STATUS_LABELS = { PENDING: 'En attente', CONFIRMED: 'Confirmé', COMPLETED: 'Terminé', CANCELLED: 'Annulé', IN_PROGRESS: 'En cours' };

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    api.get(`/appointments/${id}`)
      .then(({ data }) => setAppointment(data))
      .catch(() => Alert.alert('Erreur', 'Consultation introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  async function doAction(action) {
    setActing(true);
    try {
      await api.put(`/appointments/${id}/${action}`);
      const { data } = await api.get(`/appointments/${id}`);
      setAppointment(data);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Action impossible');
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#1a73e8" size="large" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#777' }}>Consultation introuvable</Text>
      </View>
    );
  }

  const isDoctor = user?.role === 'DOCTOR';
  const other = isDoctor ? appointment.patient : appointment.doctor;
  const otherName = isDoctor
    ? `${appointment.patient?.prenom || ''} ${appointment.patient?.nom || ''}`
    : `Dr ${appointment.doctor?.prenom || ''} ${appointment.doctor?.nom || ''}`;

  const statusColor = STATUS_COLORS[appointment.status] || '#999';

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#1a73e8' }} />

      {/* Header */}
      <View style={{ backgroundColor: '#1a73e8', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: '#fff', fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 }}>Détail consultation</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {/* Status banner */}
        <View style={{ backgroundColor: statusColor + '15', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: statusColor + '40' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#111' }}>{otherName}</Text>
              {!isDoctor && <Text style={{ color: '#777', fontSize: 13 }}>{appointment.doctor?.specialite}</Text>}
            </View>
            <View style={{ backgroundColor: statusColor + '25', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ color: statusColor, fontWeight: '700', fontSize: 12 }}>{STATUS_LABELS[appointment.status]}</Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 12, color: '#111' }}>Informations</Text>

          {[
            { label: 'Type', value: appointment.type === 'IMMEDIATE' ? '⚡ Immédiate' : appointment.type === 'SCHEDULED' ? '📅 Planifiée' : '🏥 Physique' },
            { label: 'Mode', value: appointment.consultationType || 'CHAT' },
            appointment.scheduledAt && { label: 'Date', value: new Date(appointment.scheduledAt).toLocaleString('fr-FR') },
            appointment.payment && { label: 'Montant payé', value: `${appointment.payment.amount?.toLocaleString()} FCFA` },
          ].filter(Boolean).map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <Text style={{ color: '#777', fontSize: 13 }}>{item.label}</Text>
              <Text style={{ color: '#111', fontSize: 13, fontWeight: '500' }}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        {(appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS') && (
          <TouchableOpacity
            onPress={() => {
              if (appointment.conversation?.id) {
                router.push(`/chat/${appointment.conversation.id}`);
              } else {
                Alert.alert('Info', 'La conversation sera disponible après la confirmation.');
              }
            }}
            style={{ backgroundColor: '#1a73e8', borderRadius: 14, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
          >
            <Text style={{ fontSize: 20 }}>💬</Text>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Rejoindre le chat</Text>
          </TouchableOpacity>
        )}

        {/* Doctor actions */}
        {isDoctor && appointment.status === 'PENDING' && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => doAction('confirm')}
              disabled={acting}
              style={{ flex: 1, backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: acting ? 0.7 : 1 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>✓ Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Annuler', 'Confirmer l\'annulation ?', [
                { text: 'Non' },
                { text: 'Oui', style: 'destructive', onPress: () => doAction('cancel') },
              ])}
              disabled={acting}
              style={{ flex: 1, backgroundColor: '#fee2e2', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: acting ? 0.7 : 1 }}
            >
              <Text style={{ color: '#ef4444', fontWeight: '700' }}>✗ Refuser</Text>
            </TouchableOpacity>
          </View>
        )}

        {isDoctor && appointment.status === 'CONFIRMED' && (
          <TouchableOpacity
            onPress={() => doAction('complete')}
            disabled={acting}
            style={{ backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: acting ? 0.7 : 1 }}
          >
            <Text style={{ color: '#444', fontWeight: '600' }}>Marquer terminé</Text>
          </TouchableOpacity>
        )}

        {/* Patient: cancel pending */}
        {!isDoctor && appointment.status === 'PENDING' && (
          <TouchableOpacity
            onPress={() => Alert.alert('Annuler', 'Annuler ce rendez-vous ?', [
              { text: 'Non' },
              { text: 'Oui', style: 'destructive', onPress: () => doAction('cancel') },
            ])}
            disabled={acting}
            style={{ borderWidth: 1.5, borderColor: '#fca5a5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: acting ? 0.7 : 1 }}
          >
            <Text style={{ color: '#ef4444', fontWeight: '600' }}>Annuler le rendez-vous</Text>
          </TouchableOpacity>
        )}

        {acting && <ActivityIndicator color="#1a73e8" />}
      </ScrollView>
    </View>
  );
}
