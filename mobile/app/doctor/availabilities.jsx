import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import api from '../../services/api';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function DoctorAvailabilitiesScreen() {
  const [avs, setAvs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dayOfWeek: 1, startTime: '08:00', endTime: '17:00' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/doctors/my/availabilities')
      .then(({ data }) => setAvs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function addAv() {
    setSaving(true);
    try {
      const { data } = await api.post('/doctors/availabilities', form);
      setAvs([...avs, data]);
      setShowForm(false);
    } catch { Alert.alert('Erreur', 'Impossible d\'ajouter'); }
    finally { setSaving(false); }
  }

  async function deleteAv(id) {
    try {
      await api.delete(`/doctors/availabilities/${id}`);
      setAvs(avs.filter((a) => a.id !== id));
    } catch { Alert.alert('Erreur'); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#1a73e8' }} />
      <View style={{ backgroundColor: '#1a73e8', paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Mes disponibilités</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={{ backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 12 }}>Nouvelle disponibilité</Text>
          <Text style={{ color: '#555', fontSize: 13, marginBottom: 6 }}>Jour</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {DAYS.map((d, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setForm({ ...form, dayOfWeek: i })}
                style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: form.dayOfWeek === i ? '#1a73e8' : '#f3f4f6' }}
              >
                <Text style={{ color: form.dayOfWeek === i ? '#fff' : '#444', fontSize: 12, fontWeight: '500' }}>{d.slice(0, 3)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#555', fontSize: 13, marginBottom: 6 }}>Début</Text>
              <TextInput style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, fontSize: 14 }} value={form.startTime} onChangeText={(v) => setForm({ ...form, startTime: v })} placeholder="HH:MM" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#555', fontSize: 13, marginBottom: 6 }}>Fin</Text>
              <TextInput style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, fontSize: 14 }} value={form.endTime} onChangeText={(v) => setForm({ ...form, endTime: v })} placeholder="HH:MM" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity onPress={addAv} disabled={saving} style={{ flex: 1, backgroundColor: '#1a73e8', borderRadius: 10, paddingVertical: 12, alignItems: 'center', opacity: saving ? 0.7 : 1 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{saving ? '...' : 'Enregistrer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowForm(false)} style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: '#444', fontWeight: '600' }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#1a73e8" /> : (
        <FlatList
          data={avs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', fontSize: 15, color: '#111' }}>{DAYS[item.dayOfWeek]}</Text>
                <Text style={{ color: '#777', fontSize: 13 }}>{item.startTime} – {item.endTime}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteAv(item.id)} style={{ padding: 8 }}>
                <Text style={{ fontSize: 20 }}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 40 }}>🗓️</Text>
              <Text style={{ color: '#777', marginTop: 8 }}>Aucune disponibilité</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
