import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PatientProfile() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const patient = user?.patient;
  const [form, setForm] = useState({
    nom: patient?.nom || '',
    prenom: patient?.prenom || '',
    email: user?.email || '',
    sexe: patient?.sexe || '',
    adresse: patient?.adresse || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.put('/users/me', form);
      const { data } = await api.get('/users/me');
      setUser(data);
      Alert.alert('Succès', 'Profil mis à jour');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/auth/login');
  }

  const inputStyle = { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, marginBottom: 14, backgroundColor: '#fff' };
  const labelStyle = { fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#1a73e8' }} />
      <ScrollView>
        <View style={{ backgroundColor: '#1a73e8', padding: 20, alignItems: 'center', paddingBottom: 32 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{patient?.prenom} {patient?.nom}</Text>
          <Text style={{ color: '#b3d1ff', fontSize: 13 }}>{user?.phone}</Text>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={labelStyle}>Prénom</Text>
          <TextInput style={inputStyle} value={form.prenom} onChangeText={(v) => setForm({ ...form, prenom: v })} />

          <Text style={labelStyle}>Nom</Text>
          <TextInput style={inputStyle} value={form.nom} onChangeText={(v) => setForm({ ...form, nom: v })} />

          <Text style={labelStyle}>Email</Text>
          <TextInput style={inputStyle} value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />

          <Text style={labelStyle}>Adresse</Text>
          <TextInput style={inputStyle} value={form.adresse} onChangeText={(v) => setForm({ ...form, adresse: v })} placeholder="Quartier, ville" />

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{ backgroundColor: '#1a73e8', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: saving ? 0.7 : 1, marginBottom: 12 }}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Sauvegarder</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={{ borderWidth: 1.5, borderColor: '#fca5a5', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 16 }}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
