import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../stores/authStore';
import { disconnectSocket } from '../hooks/useSocket';

export default function Profile() {
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const profile = user?.patient || user?.doctor;
  const [form, setForm] = useState({
    nom: profile?.nom || '',
    prenom: profile?.prenom || '',
    email: user?.email || '',
    sexe: profile?.sexe || '',
    adresse: profile?.adresse || '',
    specialite: profile?.specialite || '',
    tarif: profile?.tarif || '',
    description: profile?.description || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/me', form);
      const { data } = await api.get('/users/me');
      setUser(data);
      toast.success('Profil mis à jour !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    disconnectSocket();
    logout();
    navigate('/login');
  }

  return (
    <div className="p-4 space-y-5 pb-8">
      <h2 className="text-xl font-bold text-gray-900">Mon profil</h2>

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-3xl overflow-hidden">
          {user?.doctor?.photo ? <img src={user.doctor.photo} className="w-full h-full object-cover" alt="" /> : user?.role === 'DOCTOR' ? '👨‍⚕️' : '👤'}
        </div>
        <div>
          <p className="font-bold text-gray-900">{profile?.prenom} {profile?.nom}</p>
          <p className="text-sm text-gray-500">{user?.phone}</p>
          <span className="text-xs bg-primary-100 text-primary-700 font-medium px-2 py-0.5 rounded-full">
            {user?.role === 'ADMIN' ? 'Administrateur' : user?.role === 'DOCTOR' ? 'Médecin' : 'Patient'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input className="input-field" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input className="input-field" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        {user?.role === 'PATIENT' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
              <select className="input-field" value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })}>
                <option value="">-</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input className="input-field" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} placeholder="Quartier, ville" />
            </div>
          </>
        )}

        {user?.role === 'DOCTOR' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
              <input className="input-field" value={form.specialite} onChange={(e) => setForm({ ...form, specialite: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarif (FCFA)</label>
              <input className="input-field" type="number" value={form.tarif} onChange={(e) => setForm({ ...form, tarif: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </>
        )}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
      </form>

      <button onClick={handleLogout} className="w-full btn-secondary text-red-500 border-red-200 hover:bg-red-50">
        Se déconnecter
      </button>
    </div>
  );
}
