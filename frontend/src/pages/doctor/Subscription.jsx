import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function DoctorSubscription() {
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ method: 'MTN_MONEY', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/subscription/status').then(({ data }) => setStatus(data)).catch(() => {});
  }, []);

  async function subscribe(e) {
    e.preventDefault();
    if (!form.phone) return toast.error('Numéro Mobile Money requis');
    setLoading(true);
    try {
      await api.post('/subscription', form);
      toast.success('Abonnement activé !');
      const { data } = await api.get('/subscription/status');
      setStatus(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Abonnement</h2>

      {/* Statut actuel */}
      <div className={`card ${status?.subscriptionActive ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{status?.subscriptionActive ? '✅' : '⚠️'}</span>
          <div>
            <p className="font-bold text-gray-900">
              {status?.subscriptionActive ? 'Abonnement actif' : 'Abonnement inactif'}
            </p>
            {status?.subscriptionEnd && (
              <p className="text-sm text-gray-600">
                Valide jusqu'au {format(new Date(status.subscriptionEnd), 'd MMMM yyyy', { locale: fr })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Avantages */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-3">Inclus dans l'abonnement</h3>
        {[
          'Accès à tous les patients de la plateforme',
          'Messagerie sécurisée',
          'Gestion des rendez-vous',
          'Génération d\'ordonnances PDF',
          'Notifications SMS automatiques',
          'Support technique prioritaire',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 mb-2 text-sm text-gray-700">
            <span className="text-green-500">✓</span>
            <span>{item}</span>
          </div>
        ))}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-2xl font-bold text-primary-600">20 000 FCFA</p>
          <p className="text-gray-500 text-sm">par mois</p>
        </div>
      </div>

      {/* Formulaire paiement */}
      {!status?.subscriptionActive && (
        <form onSubmit={subscribe} className="card space-y-4">
          <h3 className="font-bold text-gray-900">S'abonner maintenant</h3>
          <div className="space-y-2">
            {[
              { value: 'MTN_MONEY', label: '📱 MTN Money' },
              { value: 'AIRTEL_MONEY', label: '📱 Airtel Money' },
            ].map((m) => (
              <label
                key={m.value}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${
                  form.method === m.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value={m.value}
                  checked={form.method === m.value}
                  onChange={() => setForm({ ...form, method: m.value })}
                  className="accent-primary-500"
                />
                <span className="font-medium text-sm">{m.label}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro Mobile Money</label>
            <input
              className="input-field"
              type="tel"
              placeholder="+242 06 XXX XXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Paiement en cours...' : 'Payer 20 000 FCFA et s\'abonner'}
          </button>
        </form>
      )}
    </div>
  );
}
