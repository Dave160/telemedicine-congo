import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { phone, devOtp } = useLocalSearchParams();
  const { init } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (devOtp) Alert.alert('Code de test (dev)', `Votre OTP: ${devOtp}`);
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  async function handleVerify() {
    const code = otp.join('');
    if (code.length !== 6) { Alert.alert('Erreur', 'Entrez le code à 6 chiffres'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp: code });
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await init();
      if (data.role === 'DOCTOR') router.replace('/doctor');
      else if (data.role === 'ADMIN') router.replace('/admin');
      else router.replace('/patient');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Code incorrect');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>📱</Text>
      <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#111', marginBottom: 8 }}>Vérification</Text>
      <Text style={{ fontSize: 14, textAlign: 'center', color: '#777', marginBottom: 32 }}>
        Code OTP envoyé au{'\n'}<Text style={{ fontWeight: '600', color: '#333' }}>{phone}</Text>
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            style={{
              width: 48, height: 56, borderWidth: 2, borderRadius: 12, textAlign: 'center',
              fontSize: 22, fontWeight: 'bold',
              borderColor: digit ? '#2db87a' : '#e5e7eb',
              backgroundColor: digit ? '#d1fae5' : '#fff',
              color: '#2db87a',
            }}
            maxLength={1}
            keyboardType="numeric"
            value={digit}
            onChangeText={(v) => handleChange(i, v)}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading}
        style={{ backgroundColor: '#2db87a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Confirmer</Text>}
      </TouchableOpacity>
    </View>
  );
}
