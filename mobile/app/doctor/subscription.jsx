import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import api from '../../services/api';

export default function DoctorSubscriptionScreen() {
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ method: 'MTN_MONEY', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/subscription/status').then(({ data }) => setStatus(data)).catch(() => {});
  }, []);

  async function subscribe() {
    if (!form.phone) { Alert.alert('Erreur', 'Numéro Mobile Money requis'); return; }
    setLoading(true);
    try {
      await api.post('/subscription', form);
      const { data } = await api.get('/subscription/status');
      setStatus(data);
      Alert.alert('Succès', 'Abonnement activé !');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur de paiement');
    } finally { setLoading(false); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#1a73e8' }} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 20 }}>Mon abonnement</Text>

        {/* Statut */}
        <View style={{ backgroundColor: status?.subscriptionActive ? '#f0fdf4' : '#fffbeb', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: status?.subscriptionActive ? '#bbf7d0' : '#fde68a' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 28 }}>{status?.subscriptionActive ? '✅' : '⚠️'}</Text>
            <View>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#111' }}>{status?.subscriptionActive ? 'Abonnement actif' : 'Abonnement inactif'}</Text>
              {status?.subscriptionEnd && <Text style={{ color: '#555', fontSize: 13 }}>Valide jusqu'au {new Date(status.subscriptionEnd).toLocaleDateString('fr-FR')}</Text>}
            </View>
          </View>
        </View>

        {/* Avantages */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 12 }}>Inclus dans l'abonnement</Text>
          {['Accès à tous les patients', 'Messagerie sécurisée', 'Gestion des rendez-vous', 'Ordonnances PDF', 'Notifications SMS'].map((item) => (
            <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Text style={{ color: '#22c55e', fontSize: 16 }}>✓</Text>
              <Text style={{ color: '#444', fontSize: 14 }}>{item}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1a73e8', marginTop: 12 }}>20 000 FCFA</Text>
          <Text style={{ color: '#777', fontSize: 13 }}>par mois</Text>
        </View>

        {!status?.subscriptionActive && (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 14 }}>S'abonner maintenant</Text>
            {['MTN_MONEY', 'AIRTEL_MONEY'].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setForm({ ...form, method: m })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 2, marginBottom: 10, borderColor: form.method === m ? '#1a73e8' : '#e5e7eb', backgroundColor: form.method === m ? '#e8f0fe' : '#fff' }}
              >
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: form.method === m ? '#1a73e8' : '#e5e7eb', backgroundColor: form.method === m ? '#1a73e8' : '#fff', alignItems: 'center', justifyContent: 'center' }}>
                  {form.method === m && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                </View>
                <Text style={{ fontWeight: '600', color: form.method === m ? '#1a73e8' : '#444' }}>
                  📱 {m === 'MTN_MONEY' ? 'MTN Money' : 'Airtel Money'}
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={{ color: '#555', fontSize: 13, marginBottom: 8 }}>Numéro Mobile Money</Text>
            <TextInput
              style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, marginBottom: 16, backgroundColor: '#fff' }}
              placeholder="+242 06 XXX XXXX"
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
              keyboardType="phone-pad"
            />
            <TouchableOpacity onPress={subscribe} disabled={loading} style={{ backgroundColor: '#1a73e8', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Payer 20 000 FCFA</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
