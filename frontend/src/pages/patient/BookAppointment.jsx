import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const CONSULTATION_TYPES = [
  { value: 'CHAT', label: '💬 Chat', desc: 'Messagerie texte' },
  { value: 'AUDIO', label: '🎙️ Audio', desc: 'Appel vocal' },
  { value: 'VIDEO', label: '🎥 Vidéo', desc: 'Appel vidéo' },
  { value: 'PHYSICAL', label: '🏥 Physique', desc: 'En cabinet' },
];

const PAYMENT_METHODS = [
  { value: 'MTN_MONEY', label: '📱 MTN Money', color: 'yellow' },
  { value: 'AIRTEL_MONEY', label: '📱 Airtel Money', color: 'red' },
  { value: 'CARD', label: '💳 Carte bancaire', color: 'blue' },
];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [doctor, setDoctor] = useState(null);
  const [step, setStep] = useState(1); // 1=type, 2=date, 3=paiement
  const [form, setForm] = useState({
    type: 'IMMEDIATE',
    consultationType: 'CHAT',
    scheduledAt: '',
    notes: '',
    paymentMethod: 'MTN_MONEY',
    paymentPhone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/doctors/${doctorId}`).then(({ data }) => setDoctor(data)).catch(() => navigate(-1));
  }, [doctorId]);

  async function handleBook() {
    if (!user?.patient && !user?.doctor) {
      toast.error('Complétez votre profil avant de réserver');
      navigate('/profile');
      return;
    }

    setLoading(true);
    try {
      const { data: appt } = await api.post('/appointments', {
        doctorId,
        type: form.type,
        consultationType: form.consultationType,
        scheduledAt: form.scheduledAt || undefined,
        notes: form.notes || undefined,
      });

      // Paiement
      await api.post('/payments/initiate', {
        appointmentId: appt.id,
        method: form.paymentMethod,
        phone: form.paymentPhone,
      });

      toast.success('Consultation réservée et paiement confirmé !');
      navigate(`/appointments/${appt.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  }

  if (!doctor) return null;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white">
      {/* Header */}
      <div className="bg-primary-500 text-white px-4 py-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-white text-xl">←</button>
        <div>
          <h2 className="font-bold">Réserver une consultation</h2>
          <p className="text-primary-100 text-xs">Dr {doctor.prenom} {doctor.nom}</p>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Étape 1: Type de consultation */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">1. Type de consultation</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'IMMEDIATE', label: '⚡ Immédiat', desc: 'Maintenant', disabled: !doctor.isAvailableNow },
              { value: 'SCHEDULED', label: '📅 Planifié', desc: 'Prendre RDV' },
              { value: 'PHYSICAL', label: '🏥 Physique', desc: 'En cabinet' },
            ].map((t) => (
              <button
                key={t.value}
                disabled={t.disabled}
                onClick={() => setForm({ ...form, type: t.value })}
                className={`p-3 rounded-xl border-2 text-left transition-colors disabled:opacity-40 ${
                  form.type === t.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <p className="font-semibold text-sm">{t.label}</p>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Date (si planifié) */}
        {form.type === 'SCHEDULED' && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">2. Date et heure</h3>
            <input
              type="datetime-local"
              className="input-field"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>
        )}

        {/* Mode consultation en ligne */}
        {form.type !== 'PHYSICAL' && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              {CONSULTATION_TYPES.filter((t) => t.value !== 'PHYSICAL').map((t) => (
                <button
                  key={t.value}
                  onClick={() => setForm({ ...form, consultationType: t.value })}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${
                    form.consultationType === t.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <p className="font-semibold text-sm">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block font-bold text-gray-900 mb-2">Note pour le médecin (optionnel)</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Décrivez brièvement votre problème..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {/* Paiement */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Paiement</h3>
          <div className="card mb-3 bg-gray-50">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Consultation</span>
              <span className="font-semibold">{doctor.tarif?.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Frais plateforme inclus</span>
              <span>1 000 FCFA</span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.value}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  form.paymentMethod === m.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={m.value}
                  checked={form.paymentMethod === m.value}
                  onChange={() => setForm({ ...form, paymentMethod: m.value })}
                  className="accent-primary-500"
                />
                <span className="font-medium text-sm">{m.label}</span>
              </label>
            ))}
          </div>

          {form.paymentMethod !== 'CARD' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro Mobile Money</label>
              <input
                className="input-field"
                type="tel"
                placeholder="+242 06 XXX XXXX"
                value={form.paymentPhone}
                onChange={(e) => setForm({ ...form, paymentPhone: e.target.value })}
              />
            </div>
          )}
        </div>

        <button onClick={handleBook} disabled={loading} className="btn-primary">
          {loading ? 'Réservation en cours...' : `Payer ${doctor.tarif?.toLocaleString()} FCFA et réserver`}
        </button>
      </div>
    </div>
  );
}
