import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ROLES = { PATIENT: 'bg-blue-100 text-blue-700', DOCTOR: 'bg-green-100 text-green-700', ADMIN: 'bg-purple-100 text-purple-700' };

export default function AdminUsers() {
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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Utilisateurs</h2>
        <span className="text-sm text-gray-500">{users.length} total</span>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          className="input pl-9"
          placeholder="Rechercher (téléphone, email)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        {[{ v: '', l: 'Tous' }, { v: 'PATIENT', l: 'Patients' }, { v: 'DOCTOR', l: 'Médecins' }, { v: 'ADMIN', l: 'Admins' }].map((r) => (
          <button
            key={r.v}
            onClick={() => setRoleFilter(r.v)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              roleFilter === r.v ? 'bg-primary-500 text-white border-primary-500' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            {r.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="card h-14 bg-gray-100 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-gray-500">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                  {u.role === 'DOCTOR' ? '👨‍⚕️' : u.role === 'ADMIN' ? '🛡️' : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {u.doctor
                        ? `Dr ${u.doctor.prenom} ${u.doctor.nom}`
                        : u.patient
                        ? `${u.patient.prenom} ${u.patient.nom}`
                        : u.phone}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${ROLES[u.role]}`}>
                      {u.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {u.phone}
                    {u.email ? ` · ${u.email}` : ''}
                    {u.isVerified ? ' · ✓ vérifié' : ' · ⚠ non vérifié'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
