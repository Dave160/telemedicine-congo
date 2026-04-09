import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminDoctors() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/doctors/pending').then(({ data }) => setPending(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleVerify(id, approve) {
    try {
      await api.put(`/admin/doctors/${id}/verify`, { approve });
      setPending(pending.filter((d) => d.id !== id));
      toast.success(approve ? 'Médecin validé ✓' : 'Médecin rejeté');
    } catch {
      toast.error('Erreur');
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Validation des médecins</h2>
      <p className="text-sm text-gray-500">{pending.length} médecin(s) en attente</p>

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="card h-24 bg-gray-100 animate-pulse" />)}</div>
      ) : pending.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-4xl mb-2">✅</p>
          <p className="text-gray-500">Aucun médecin en attente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((doc) => (
            <div key={doc.id} className="card">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl">👨‍⚕️</div>
                <div>
                  <p className="font-bold text-gray-900">Dr {doc.prenom} {doc.nom}</p>
                  <p className="text-sm text-gray-500">{doc.specialite}</p>
                  <p className="text-xs text-gray-400">{doc.user?.phone} • {doc.user?.email}</p>
                </div>
              </div>
              {doc.description && <p className="text-sm text-gray-600 mb-3">{doc.description}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerify(doc.id, true)}
                  className="flex-1 bg-green-500 text-white font-semibold py-2 rounded-xl text-sm"
                >
                  ✓ Valider
                </button>
                <button
                  onClick={() => handleVerify(doc.id, false)}
                  className="flex-1 bg-red-100 text-red-600 font-semibold py-2 rounded-xl text-sm"
                >
                  ✗ Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
