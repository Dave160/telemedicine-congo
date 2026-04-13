import { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../../services/api';

const ROLE_COLORS = { PATIENT: '#3b82f6', DOCTOR: '#22c55e', ADMIN: '#8b5cf6' };
const ROLE_ICONS = { PATIENT: '👤', DOCTOR: '👨‍⚕️', ADMIN: '🛡️' };

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    api.get('/admin/users')
      .then(({ data }) => setUsers(data.users || data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const text = `${u.phone} ${u.email || ''}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />
      <View style={{ backgroundColor: '#2db87a', paddingHorizontal: 16, paddingBottom: 14 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Utilisateurs ({users.length})
        </Text>
        <TextInput
          style={{ backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 }}
          placeholder="🔍 Rechercher (téléphone, email)..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Role filter */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
        {[{ v: '', l: 'Tous' }, { v: 'PATIENT', l: 'Patients' }, { v: 'DOCTOR', l: 'Médecins' }, { v: 'ADMIN', l: 'Admins' }].map((r) => (
          <TouchableOpacity
            key={r.v}
            onPress={() => setRoleFilter(r.v)}
            style={{ flex: 1, paddingVertical: 6, borderRadius: 20, backgroundColor: roleFilter === r.v ? '#2db87a' : '#f3f4f6', alignItems: 'center' }}
          >
            <Text style={{ color: roleFilter === r.v ? '#fff' : '#555', fontSize: 11, fontWeight: '600' }}>{r.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2db87a" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const color = ROLE_COLORS[item.role] || '#9ca3af';
            const name = item.doctor
              ? `Dr ${item.doctor.prenom} ${item.doctor.nom}`
              : item.patient
              ? `${item.patient.prenom} ${item.patient.nom}`
              : item.phone;

            return (
              <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color + '15', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 22 }}>{ROLE_ICONS[item.role] || '👤'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14, color: '#111', flex: 1 }} numberOfLines={1}>{name}</Text>
                    <View style={{ backgroundColor: color + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{item.role}</Text>
                    </View>
                  </View>
                  <Text style={{ color: '#9ca3af', fontSize: 12 }} numberOfLines={1}>
                    {item.phone}
                    {item.email ? ` · ${item.email}` : ''}
                  </Text>
                  <Text style={{ color: item.isVerified ? '#22c55e' : '#f59e0b', fontSize: 11, marginTop: 2, fontWeight: '500' }}>
                    {item.isVerified ? '✓ Vérifié' : '⚠ Non vérifié'}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 40 }}>👥</Text>
              <Text style={{ color: '#777', marginTop: 8 }}>Aucun utilisateur trouvé</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
