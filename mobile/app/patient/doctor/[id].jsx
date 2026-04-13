import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../services/api';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function DoctorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookModal, setBookModal] = useState(false);
  const [booking, setBooking] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [pendingApptId, setPendingApptId] = useState(null);
  const [form, setForm] = useState({
    type: 'SCHEDULED',
    consultationType: 'CHAT',
    scheduledAt: '',
    notes: '',
  });
  const [payForm, setPayForm] = useState({ method: 'MTN_MONEY', phone: '' });

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then(({ data }) => setDoctor(data))
      .catch(() => Alert.alert('Erreur', 'Médecin introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBook() {
    if (form.type !== 'IMMEDIATE' && !form.scheduledAt) {
      Alert.alert('Erreur', 'Veuillez choisir une date et heure');
      return;
    }
    setBooking(true);
    try {
      const payload = {
        doctorId: id,
        type: form.type,
        consultationType: form.consultationType,
        notes: form.notes,
      };
      if (form.type !== 'IMMEDIATE') payload.scheduledAt = new Date(form.scheduledAt).toISOString();
      const { data } = await api.post('/appointments', payload);
      setPendingApptId(data.appointment?.id || data.id);
      setBookModal(false);
      setPayModal(true);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible de réserver');
    } finally {
      setBooking(false);
    }
  }

  async function handlePay() {
    if (!payForm.phone) { Alert.alert('Erreur', 'Numéro Mobile Money requis'); return; }
    setPaying(true);
    try {
      await api.post('/payments/initiate', {
        appointmentId: pendingApptId,
        method: payForm.method,
        phoneNumber: payForm.phone,
      });
      setPayModal(false);
      Alert.alert('Succès', 'Paiement initié ! Votre consultation a été confirmée.', [
        { text: 'Voir mes RDV', onPress: () => router.replace('/patient/appointments') },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur de paiement');
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#2db87a" size="large" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#777' }}>Médecin introuvable</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />

      {/* Header */}
      <View style={{ backgroundColor: '#2db87a', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: '#fff', fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 }}>Profil médecin</Text>
      </View>

      <ScrollView>
        {/* Doctor card */}
        <View style={{ backgroundColor: '#2db87a', padding: 20, alignItems: 'center', paddingBottom: 28 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 40 }}>👨‍⚕️</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Dr {doctor.prenom} {doctor.nom}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 2 }}>{doctor.specialite}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
            {doctor.isAvailableNow && (
              <>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' }} />
                <Text style={{ color: '#86efac', fontSize: 12, fontWeight: '600' }}>Disponible maintenant</Text>
              </>
            )}
          </View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 8 }}>
            {doctor.tarif?.toLocaleString()} FCFA
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>par consultation</Text>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {/* Bio */}
          {doctor.description && (
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 8, color: '#111' }}>À propos</Text>
              <Text style={{ color: '#555', fontSize: 14, lineHeight: 20 }}>{doctor.description}</Text>
            </View>
          )}

          {/* Availabilities */}
          {doctor.availabilities?.length > 0 && (
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 10, color: '#111' }}>Disponibilités</Text>
              {doctor.availabilities.map((av) => (
                <View key={av.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                  <Text style={{ color: '#444', fontWeight: '500' }}>{DAYS[av.dayOfWeek]}</Text>
                  <Text style={{ color: '#777' }}>{av.startTime} – {av.endTime}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Book button */}
          <TouchableOpacity
            onPress={() => setBookModal(true)}
            style={{ backgroundColor: '#2db87a', borderRadius: 14, paddingVertical: 16, alignItems: 'center', elevation: 3 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Prendre rendez-vous</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Book Modal */}
      <Modal visible={bookModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#111' }}>Réserver une consultation</Text>

            {/* Type */}
            <Text style={{ color: '#555', fontSize: 13, marginBottom: 8 }}>Type de consultation</Text>
            {[
              { v: 'IMMEDIATE', l: '⚡ Immédiate', desc: 'Consultation maintenant' },
              { v: 'SCHEDULED', l: '📅 Planifiée', desc: 'Choisir un créneau' },
              { v: 'PHYSICAL', l: '🏥 Physique', desc: 'Au cabinet médical' },
            ].map((t) => (
              <TouchableOpacity
                key={t.v}
                onPress={() => setForm({ ...form, type: t.v })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 2, marginBottom: 8, borderColor: form.type === t.v ? '#2db87a' : '#e5e7eb', backgroundColor: form.type === t.v ? '#d1fae5' : '#fff' }}
              >
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: form.type === t.v ? '#2db87a' : '#d1d5db', backgroundColor: form.type === t.v ? '#2db87a' : '#fff', alignItems: 'center', justifyContent: 'center' }}>
                  {form.type === t.v && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                </View>
                <View>
                  <Text style={{ fontWeight: '600', color: form.type === t.v ? '#2db87a' : '#444' }}>{t.l}</Text>
                  <Text style={{ fontSize: 11, color: '#999' }}>{t.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Mode */}
            <Text style={{ color: '#555', fontSize: 13, marginBottom: 8, marginTop: 4 }}>Mode</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {[{ v: 'CHAT', l: '💬 Chat' }, { v: 'AUDIO', l: '📞 Audio' }, { v: 'VIDEO', l: '📹 Vidéo' }].map((m) => (
                <TouchableOpacity
                  key={m.v}
                  onPress={() => setForm({ ...form, consultationType: m.v })}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: form.consultationType === m.v ? '#2db87a' : '#e5e7eb', backgroundColor: form.consultationType === m.v ? '#d1fae5' : '#fff' }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: form.consultationType === m.v ? '#2db87a' : '#555' }}>{m.l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date if scheduled */}
            {form.type === 'SCHEDULED' && (
              <>
                <Text style={{ color: '#555', fontSize: 13, marginBottom: 6 }}>Date et heure (YYYY-MM-DDTHH:MM)</Text>
                <TextInput
                  style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, marginBottom: 12 }}
                  placeholder="Ex: 2025-06-15T10:00"
                  value={form.scheduledAt}
                  onChangeText={(v) => setForm({ ...form, scheduledAt: v })}
                />
              </>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <TouchableOpacity onPress={() => setBookModal(false)} style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: '#444', fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBook} disabled={booking} style={{ flex: 1, backgroundColor: '#2db87a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: booking ? 0.7 : 1 }}>
                {booking ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Confirmer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pay Modal */}
      <Modal visible={payModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6, color: '#111' }}>Paiement Mobile Money</Text>
            <Text style={{ color: '#777', fontSize: 13, marginBottom: 16 }}>Montant : {doctor.tarif?.toLocaleString()} FCFA</Text>

            {['MTN_MONEY', 'AIRTEL_MONEY'].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setPayForm({ ...payForm, method: m })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 2, marginBottom: 10, borderColor: payForm.method === m ? '#2db87a' : '#e5e7eb', backgroundColor: payForm.method === m ? '#d1fae5' : '#fff' }}
              >
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: payForm.method === m ? '#2db87a' : '#d1d5db', backgroundColor: payForm.method === m ? '#2db87a' : '#fff', alignItems: 'center', justifyContent: 'center' }}>
                  {payForm.method === m && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                </View>
                <Text style={{ fontWeight: '600', color: payForm.method === m ? '#2db87a' : '#444' }}>
                  📱 {m === 'MTN_MONEY' ? 'MTN Money' : 'Airtel Money'}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={{ color: '#555', fontSize: 13, marginBottom: 6 }}>Numéro Mobile Money</Text>
            <TextInput
              style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, marginBottom: 16 }}
              placeholder="+242 06 XXX XXXX"
              value={payForm.phone}
              onChangeText={(v) => setPayForm({ ...payForm, phone: v })}
              keyboardType="phone-pad"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setPayModal(false)} style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: '#444', fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePay} disabled={paying} style={{ flex: 1, backgroundColor: '#2db87a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: paying ? 0.7 : 1 }}>
                {paying ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Payer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
