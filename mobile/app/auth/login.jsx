import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import useAuthStore from '../../stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!form.phone || !form.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.phone, form.password);
      if (user.role === 'DOCTOR') router.replace('/doctor');
      else if (user.role === 'ADMIN') router.replace('/admin');
      else router.replace('/patient');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={{ backgroundColor: '#1a73e8', paddingTop: 80, paddingBottom: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 48 }}>🏥</Text>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>TéléMéd Congo</Text>
          <Text style={{ color: '#b3d1ff', fontSize: 13, marginTop: 4 }}>Santé accessible à tous</Text>
        </View>

        <View style={{ flex: 1, padding: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 24 }}>Connexion</Text>

          <Text style={{ fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 }}>Téléphone</Text>
          <TextInput
            style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 16, backgroundColor: '#fff' }}
            placeholder="+242 06 XXX XXXX"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
          />

          <Text style={{ fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 }}>Mot de passe</Text>
          <TextInput
            style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 24, backgroundColor: '#fff' }}
            placeholder="••••••"
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{ backgroundColor: '#1a73e8', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Se connecter</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/register')} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: '#777', fontSize: 14 }}>
              Pas encore inscrit ? <Text style={{ color: '#1a73e8', fontWeight: '600' }}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
