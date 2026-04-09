import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: '', email: '', password: '', confirm: '', role: 'PATIENT' });
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!form.phone || !form.password) {
      Alert.alert('Erreur', 'Numéro de téléphone et mot de passe requis');
      return;
    }
    if (form.password !== form.confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        role: form.role,
      });
      router.push({ pathname: '/auth/verify-otp', params: { phone: form.phone, devOtp: data.devOtp || '' } });
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    marginBottom: 14, backgroundColor: '#fff'
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ backgroundColor: '#1a73e8', paddingTop: 60, paddingBottom: 30, alignItems: 'center' }}>
          <Text style={{ fontSize: 40 }}>🏥</Text>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>Créer un compte</Text>
        </View>

        <View style={{ padding: 24 }}>
          {/* Role selector */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {['PATIENT', 'DOCTOR'].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setForm({ ...form, role: r })}
                style={{
                  flex: 1, paddingVertical: 12, borderRadius: 12,
                  borderWidth: 2, alignItems: 'center',
                  borderColor: form.role === r ? '#1a73e8' : '#e5e7eb',
                  backgroundColor: form.role === r ? '#e8f0fe' : '#fff',
                }}
              >
                <Text style={{ color: form.role === r ? '#1a73e8' : '#666', fontWeight: '600' }}>
                  {r === 'PATIENT' ? '👤 Patient' : '🩺 Médecin'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 }}>Téléphone *</Text>
          <TextInput style={inputStyle} placeholder="+242 06 XXX XXXX" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />

          <Text style={{ fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 }}>Email (optionnel)</Text>
          <TextInput style={inputStyle} placeholder="vous@exemple.com" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />

          <Text style={{ fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 }}>Mot de passe *</Text>
          <TextInput style={inputStyle} placeholder="Minimum 6 caractères" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry />

          <Text style={{ fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 }}>Confirmer le mot de passe *</Text>
          <TextInput style={inputStyle} placeholder="Répéter" value={form.confirm} onChangeText={(v) => setForm({ ...form, confirm: v })} secureTextEntry />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{ backgroundColor: '#1a73e8', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: loading ? 0.7 : 1, marginTop: 8 }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>S'inscrire</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/login')} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: '#777', fontSize: 14 }}>
              Déjà inscrit ? <Text style={{ color: '#1a73e8', fontWeight: '600' }}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
