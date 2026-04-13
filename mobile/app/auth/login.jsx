import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import useAuthStore from '../../stores/authStore';

const PRIMARY = '#2db87a';
const BG      = '#fff';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: BG }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header gradient vert */}
        <View style={{
          backgroundColor: PRIMARY,
          paddingTop: 80, paddingBottom: 50,
          alignItems: 'center',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}>
          {/* Logo croix médicale */}
          <View style={{
            width: 72, height: 72, borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.25)',
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Text style={{ fontSize: 36 }}>⚕️</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>TéléMéd Congo</Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>
            Votre santé, notre priorité
          </Text>
        </View>

        <View style={{ flex: 1, padding: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 6 }}>Connexion</Text>
          <Text style={{ fontSize: 13, color: '#888', marginBottom: 28 }}>
            Entrez vos identifiants pour continuer
          </Text>

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 }}>
            Numéro de téléphone
          </Text>
          <TextInput
            style={{
              borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14,
              paddingHorizontal: 16, paddingVertical: 13, fontSize: 15,
              marginBottom: 16, backgroundColor: '#fff',
            }}
            placeholder="+242 06 XXX XXXX"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
          />

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 }}>
            Mot de passe
          </Text>
          <TextInput
            style={{
              borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14,
              paddingHorizontal: 16, paddingVertical: 13, fontSize: 15,
              marginBottom: 28, backgroundColor: '#fff',
            }}
            placeholder="••••••••"
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: PRIMARY, borderRadius: 999,
              paddingVertical: 16, alignItems: 'center',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Se connecter →</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            style={{ marginTop: 24, alignItems: 'center' }}
          >
            <Text style={{ color: '#777', fontSize: 14 }}>
              Pas encore inscrit ?{' '}
              <Text style={{ color: PRIMARY, fontWeight: '700' }}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
