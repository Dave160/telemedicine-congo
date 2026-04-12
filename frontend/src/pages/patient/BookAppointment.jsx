import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, Phone, Users, X,
  CalendarPlus, MapPin, CheckCircle, Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const PAYMENT_METHODS = [
  { value: 'MTN_MONEY',    label: 'MTN Money',    color: '#f59e0b' },
  { value: 'AIRTEL_MONEY', label: 'Airtel Money',  color: '#ef4444' },
  { value: 'CARD',         label: 'Carte bancaire', color: '#3b82f6' },
];

/* ─── Étape 1 : Données patient ─────────────────────────────── */
function PatientForm({ initialData, onNext }) {
  const [form, setForm] = useState({
    nom:           initialData?.nom           || '',
    prenom:        initialData?.prenom        || '',
    postnom:       initialData?.postnom       || '',
    dateNaissance: initialData?.dateNaissance || '',
    phone:         initialData?.phone         || '',
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    onNext(form);
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-screen">
      <div className="header-gradient px-4 pt-3 pb-4 flex items-center gap-3">
        <button type="button" onClick={() => window.history.back()} className="p-1.5 rounded-xl bg-white/20">
          <ChevronLeft size={22} color="white" strokeWidth={2} />
        </button>
        <h1 className="font-bold text-white text-base">Saisie des données</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-3">Nom complet</p>
          <div className="space-y-2">
            <input className="input-field" placeholder="Nom de famille *"
              value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            <input className="input-field" placeholder="Prénom *"
              value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
            <input className="input-field" placeholder="Post-nom (optionnel)"
              value={form.postnom} onChange={(e) => setForm({ ...form, postnom: e.target.value })} />
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">Date de naissance</p>
          <input className="input-field" type="date"
            value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })} />
        </div>

        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">Numéro de téléphone</p>
          <p className="text-xs text-gray-400 dark:text-dark-muted mb-2">
            Pour les rappels de rendez-vous
          </p>
          <div className="relative">
            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-10" type="tel" placeholder="+242 06 XXX XXXX *"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <button type="button" className="flex items-center gap-1.5 text-primary-500 text-xs font-semibold mt-2">
            <Users size={14} strokeWidth={2} />
            Choisir depuis les contacts
          </button>
        </div>

        <button type="submit" className="btn-primary">
          Continuer
          <ChevronRight size={18} />
        </button>
      </form>
    </div>
  );
}

/* ─── Étape 2 : Paiement ─────────────────────────────────────── */
function PaymentStep({ doctor, patientData, slot, date, onBack, onConfirm, loading }) {
  const [paymentMethod, setPaymentMethod] = useState('MTN_MONEY');
  const [paymentPhone, setPaymentPhone] = useState(patientData.phone || '');

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-screen">
      <div className="header-gradient px-4 pt-3 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-xl bg-white/20">
          <ChevronLeft size={22} color="white" strokeWidth={2} />
        </button>
        <h1 className="font-bold text-white text-base">Paiement</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Récapitulatif */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Patient</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              {patientData.prenom} {patientData.nom}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Médecin</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              Dr {doctor.prenom} {doctor.nom} — {doctor.specialite}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Date et heure</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm capitalize">
              {format(date, 'EEEE d MMMM yyyy', { locale: fr })}, {slot}
            </p>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Coût préliminaire</p>
            <p className="font-bold text-primary-500">{doctor.tarif?.toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>

        {/* Mode de paiement */}
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">Mode de paiement</p>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setPaymentMethod(m.value)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-colors text-left ${
                  paymentMethod === m.value
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card'
                }`}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${m.color}20` }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                </div>
                <span className="font-semibold text-sm text-gray-800 dark:text-white">{m.label}</span>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === m.value ? 'border-primary-500' : 'border-gray-300 dark:border-dark-border'
                }`}>
                  {paymentMethod === m.value && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {paymentMethod !== 'CARD' && (
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">Numéro Mobile Money</p>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-10"
                type="tel"
                placeholder="+242 06 XXX XXXX"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => onConfirm({ paymentMethod, paymentPhone })}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Réservation en cours…' : `Confirmer et payer ${doctor.tarif?.toLocaleString('fr-FR')} FCFA`}
        </button>
      </div>
    </div>
  );
}

/* ─── Étape 3 : Succès ───────────────────────────────────────── */
function SuccessModal({ doctor, patientData, slot, date, onNavigate }) {
  return (
    <div className="bg-white dark:bg-dark-bg min-h-screen">
      <div className="header-gradient px-4 pt-3 pb-5 flex items-center justify-between">
        <div className="w-10" />
        <div className="w-12 h-12 rounded-2xl bg-white/25 flex items-center justify-center">
          <CheckCircle size={28} color="white" strokeWidth={1.8} />
        </div>
        <button onClick={() => onNavigate('/dashboard')} className="p-1.5 rounded-xl bg-white/20">
          <X size={20} color="white" strokeWidth={2} />
        </button>
      </div>

      <div className="px-4 py-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">
          Vous êtes inscrit !
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted text-center mb-5">
          Votre rendez-vous a été confirmé
        </p>

        <button className="flex items-center gap-2 mx-auto text-primary-500 text-sm font-semibold mb-5">
          <Share2 size={16} strokeWidth={2} />
          Partager
        </button>

        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden mb-4">
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Patient</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{patientData.prenom} {patientData.nom}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">{doctor.specialite}</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">Dr {doctor.prenom} {doctor.nom}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Coût préliminaire</p>
            <p className="text-primary-500 font-bold text-lg">{doctor.tarif?.toLocaleString('fr-FR')} FCFA</p>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
              Coût final déterminé par le médecin
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Date et heure</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm capitalize">
              {format(date, 'EEEE d MMMM yyyy', { locale: fr })}, {slot}
            </p>
            <button className="flex items-center gap-1.5 text-primary-500 text-xs font-semibold mt-1.5">
              <CalendarPlus size={14} strokeWidth={2} />
              Ajouter au calendrier
            </button>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Adresse</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">Clinique TéléMéd Congo</p>
            <button className="flex items-center gap-1.5 text-primary-500 text-xs font-semibold mt-1.5">
              <MapPin size={14} strokeWidth={2} />
              Voir l'itinéraire
            </button>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Préparation</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Si vous avez des résultats d'examens antérieurs (échographie, scanner), veuillez les apporter.
            </p>
          </div>
        </div>

        <button onClick={() => onNavigate('/appointments')} className="btn-primary">
          Aller aux rendez-vous
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ─── Composant principal ────────────────────────────────────── */
export default function BookAppointment() {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const slotParam       = searchParams.get('slot') || '09:00';
  const dateParam       = searchParams.get('date');
  const forSelf         = sessionStorage.getItem('bookingForSelf') !== 'false';
  const appointmentDate = dateParam ? new Date(dateParam) : new Date();

  const [doctor, setDoctor] = useState(null);
  const [step, setStep] = useState(1);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialData = forSelf && user?.patient
    ? {
        nom:           user.patient.nom,
        prenom:        user.patient.prenom,
        dateNaissance: user.patient.dateNaissance?.substring(0, 10) || '',
        phone:         user.phone || '',
      }
    : {};

  useEffect(() => {
    api.get(`/doctors/${doctorId}`).then(({ data }) => setDoctor(data)).catch(() => navigate(-1));
  }, [doctorId]);

  async function handleConfirmPayment({ paymentMethod, paymentPhone }) {
    setLoading(true);
    try {
      const { data: appt } = await api.post('/appointments', {
        doctorId,
        type: 'SCHEDULED',
        consultationType: 'PHYSICAL',
        scheduledAt: (() => {
          const d = new Date(appointmentDate);
          const [h, m] = slotParam.split(':');
          d.setHours(parseInt(h), parseInt(m), 0, 0);
          return d.toISOString();
        })(),
      });
      await api.post('/payments/initiate', {
        appointmentId: appt.id,
        method: paymentMethod,
        phone: paymentPhone,
      });
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  }

  if (!doctor) return null;
  if (step === 1) return <PatientForm initialData={initialData} onNext={(d) => { setPatientData(d); setStep(2); }} />;
  if (step === 2) return (
    <PaymentStep
      doctor={doctor} patientData={patientData}
      slot={slotParam} date={appointmentDate}
      onBack={() => setStep(1)} onConfirm={handleConfirmPayment} loading={loading}
    />
  );
  return <SuccessModal doctor={doctor} patientData={patientData} slot={slotParam} date={appointmentDate} onNavigate={navigate} />;
}
