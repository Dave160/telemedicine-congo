import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function DoctorAvailabilities() {
  const [availabilities, setAvailabilities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dayOfWeek: '1', startTime: '08:00', endTime: '17:00' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/doctors/my/availabilities')
      .then(({ data }) => setAvailabilities(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function addAvailability(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/doctors/availabilities', {
        dayOfWeek: parseInt(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setAvailabilities([...availabilities, data]);
      setShowForm(false);
      toast.success('Disponibilité ajoutée');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  async function deleteAvailability(id) {
    try {
      await api.delete(`/doctors/availabilities/${id}`);
      setAvailabilities(availabilities.filter((a) => a.id !== id));
      toast.success('Supprimé');
    } catch {
      toast.error('Erreur');
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Mes disponibilités</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={addAvailability} className="card space-y-3">
          <h3 className="font-bold text-gray-900">Nouvelle disponibilité</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jour</label>
            <select
              className="input-field"
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
            >
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
              <input type="time" className="input-field" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
              <input type="time" className="input-field" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? '...' : 'Enregistrer'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="card h-16 bg-gray-100 animate-pulse" />)}</div>
      ) : availabilities.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-4xl mb-2">🗓️</p>
          <p className="text-gray-500 text-sm">Aucune disponibilité définie</p>
        </div>
      ) : (
        <div className="space-y-2">
          {availabilities.map((av) => (
            <div key={av.id} className="card flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{DAYS[av.dayOfWeek]}</p>
                <p className="text-gray-500 text-xs">{av.startTime} – {av.endTime}</p>
              </div>
              <button onClick={() => deleteAvailability(av.id)} className="text-red-400 text-xl p-2">🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
