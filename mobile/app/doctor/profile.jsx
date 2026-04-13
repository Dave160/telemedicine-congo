import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

export default function DoctorProfile() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const doctor = user?.doctor;
  const [form, setForm] = useState({
    nom: doctor?.nom || '', prenom: doctor?.prenom || '',
    email: user?.email || '', specialite: doctor?.specialite || '',
    tarif: doctor?.tarif?.toString() || '', description: doctor?.description || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.put('/users/me', { ...form, tarif: parseFloat(form.tarif) });
      const { data } = await api.get('/users/me');
      setUser(data);
      Alert.alert('Succès', 'Profil mis à jour');
    } catch { Alert.alert('Erreur'); }
    finally { setSaving(false); }
  }

  const inputStyle = { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, marginBottom: 14, backgroundColor: '#fff' };
  const labelStyle = { fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />
      <ScrollView>
        <View style={{ backgroundColor: '#2db87a', padding: 20, alignItems: 'center', paddingBottom: 28 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 32 }}>👨‍⚕️</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Dr {doctor?.prenom} {doctor?.nom}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{doctor?.specialite}</Text>
          <TouchableOpacity onPress={() => router.push('/doctor/subscription')} style={{ marginTop: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>{doctor?.subscriptionActive ? '✅ Abonné' : '⚠️ S\'abonner'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={labelStyle}>Prénom</Text>
          <TextInput style={inputStyle} value={form.prenom} onChangeText={(v) => setForm({ ...form, prenom: v })} />
          <Text style={labelStyle}>Nom</Text>
          <TextInput style={inputStyle} value={form.nom} onChangeText={(v) => setForm({ ...form, nom: v })} />
          <Text style={labelStyle}>Spécialité</Text>
          <TextInput style={inputStyle} value={form.specialite} onChangeText={(v) => setForm({ ...form, specialite: v })} />
          <Text style={labelStyle}>Tarif (FCFA)</Text>
          <TextInput style={inputStyle} value={form.tarif} onChangeText={(v) => setForm({ ...form, tarif: v })} keyboardType="numeric" />
          <Text style={labelStyle}>Description</Text>
          <TextInput style={{ ...inputStyle, height: 80 }} multiline value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />

          <TouchableOpacity onPress={handleSave} disabled={saving} style={{ backgroundColor: '#2db87a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: saving ? 0.7 : 1, marginBottom: 12 }}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Sauvegarder</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => { await logout(); router.replace('/auth/login'); }} style={{ borderWidth: 1.5, borderColor: '#fca5a5', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 16 }}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
