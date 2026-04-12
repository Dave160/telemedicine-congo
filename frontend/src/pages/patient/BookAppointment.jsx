import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const PAYMENT_METHODS = [
  { value: 'MTN_MONEY',   label: 'MTN Money',   logo: '🟡' },
  { value: 'AIRTEL_MONEY',label: 'Airtel Money', logo: '🔴' },
  { value: 'CARD',        label: 'Carte bancaire',logo: '💳' },
];

/* ─── Étape 1 : Saisie des informations patient ─── */
function PatientForm({ initialData, onNext, doctorName, slot, date }) {
  const [form, setForm] = useState({
    nom:      initialData?.nom      || '',
    prenom:   initialData?.prenom   || '',
    postnom:  initialData?.postnom  || '',
    dateNaissance: initialData?.dateNaissance || '',
    phone:    initialData?.phone    || '',
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
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border px-4 py-4 flex items-center gap-3">
        <button type="button" onClick={() => window.history.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-gray-700 dark:text-white">
            <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="font-bold text-gray-900 dark:text-white text-base">Saisie des données</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* Nom complet */}
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">Nom complet</p>
          <div className="space-y-2">
            <input
              className="input-field"
              placeholder="Nom de famille *"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
            />
            <input
              className="input-field"
              placeholder="Prénom *"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              required
            />
            <input
              className="input-field"
              placeholder="Post-nom (optionnel)"
              value={form.postnom}
              onChange={(e) => setForm({ ...form, postnom: e.target.value })}
            />
          </div>
        </div>

        {/* Date de naissance */}
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">Date de naissance</p>
          <input
            className="input-field"
            type="date"
            placeholder="Date de naissance"
            value={form.dateNaissance}
            onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
          />
        </div>

        {/* Téléphone */}
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">
            Numéro de téléphone du patient
          </p>
          <p className="text-xs text-gray-400 dark:text-dark-muted mb-2">
            Pour les rappels de rendez-vous et informations complémentaires
          </p>
          <input
            className="input-field"
            type="tel"
            placeholder="Numéro de téléphone *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <button
            type="button"
            className="flex items-center gap-1.5 text-primary-500 text-xs font-semibold mt-2"
          >
            <svg viewBox="0 0 24 24" fill="#22c55e" className="w-4 h-4">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            Choisir depuis les contacts
          </button>
        </div>

        <button type="submit" className="btn-primary flex items-center justify-center gap-2">
          Continuer
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
            <path strokeLinecap="round" d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

/* ─── Étape 2 : Paiement ─── */
function PaymentStep({ doctor, patientData, slot, date, onBack, onConfirm, loading }) {
  const [paymentMethod, setPaymentMethod] = useState('MTN_MONEY');
  const [paymentPhone, setPaymentPhone] = useState(patientData.phone || '');

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-screen">
      <div className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border px-4 py-4 flex items-center gap-3">
        <button onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-gray-700 dark:text-white">
            <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="font-bold text-gray-900 dark:text-white text-base">Paiement</h1>
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
          <div className="px-4 py-3 flex justify-between">
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
                <span className="text-xl">{m.logo}</span>
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
            <input
              className="input-field"
              type="tel"
              placeholder="+242 06 XXX XXXX"
              value={paymentPhone}
              onChange={(e) => setPaymentPhone(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={() => onConfirm({ paymentMethod, paymentPhone })}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Réservation en cours...' : `Confirmer et payer ${doctor.tarif?.toLocaleString('fr-FR')} FCFA`}
        </button>
      </div>
    </div>
  );
}

/* ─── Étape 3 : Succès ─── */
function SuccessModal({ doctor, patientData, slot, date, appointmentId, onNavigate }) {
  return (
    <div className="bg-white dark:bg-dark-bg min-h-screen">
      <div className="bg-primary-500 px-4 pt-3 pb-4 flex items-center justify-between">
        <div className="w-6" />
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
        </div>
        <button onClick={() => onNavigate('/dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">
          Vous êtes inscrit au rendez-vous !
        </h2>
        <button className="w-full flex items-center gap-2 justify-center text-primary-500 text-sm font-medium py-2 mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          Partager
        </button>

        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden mb-4">
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Patient</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {patientData.prenom} {patientData.nom}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">{doctor.specialite}</p>
            <p className="font-bold text-gray-900 dark:text-white">Dr {doctor.prenom} {doctor.nom}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Coût préliminaire</p>
            <p className="text-primary-500 font-bold text-lg">{doctor.tarif?.toLocaleString('fr-FR')} FCFA</p>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
              Le coût final est déterminé par le médecin selon les services rendus
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Date et heure</p>
            <p className="font-bold text-gray-900 dark:text-white capitalize">
              {format(date, 'EEEE d MMMM yyyy', { locale: fr })}, {slot}
            </p>
            <button className="flex items-center gap-1.5 text-primary-500 text-xs font-medium mt-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              Ajouter au calendrier
            </button>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Adresse</p>
            <p className="font-bold text-gray-900 dark:text-white">Clinique TéléMéd Congo</p>
            <button className="flex items-center gap-1.5 text-primary-500 text-xs font-medium mt-1">
              <svg viewBox="0 0 24 24" fill="#22c55e" className="w-3.5 h-3.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Voir l'itinéraire
            </button>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted">Préparation</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Si vous avez des résultats d'examens antérieurs (échographie, scanner, IRM, radio), veuillez les apporter lors de la consultation.
            </p>
          </div>
        </div>

        <button onClick={() => onNavigate('/appointments')} className="btn-primary flex items-center justify-center gap-2">
          Aller aux rendez-vous à venir
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
            <path strokeLinecap="round" d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Composant principal ─── */
export default function BookAppointment() {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const slotParam  = searchParams.get('slot') || '09:00';
  const dateParam  = searchParams.get('date');
  const forSelf    = sessionStorage.getItem('bookingForSelf') !== 'false';

  const appointmentDate = dateParam ? new Date(dateParam) : new Date();

  const [doctor, setDoctor] = useState(null);
  const [step, setStep] = useState(1); // 1=form, 2=payment, 3=success
  const [patientData, setPatientData] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pré-remplissage si "Me programmer"
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

      setAppointmentId(appt.id);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  }

  if (!doctor) return null;

  if (step === 1) {
    return (
      <PatientForm
        initialData={initialData}
        doctorName={`Dr ${doctor.prenom} ${doctor.nom}`}
        slot={slotParam}
        date={appointmentDate}
        onNext={(data) => { setPatientData(data); setStep(2); }}
      />
    );
  }

  if (step === 2) {
    return (
      <PaymentStep
        doctor={doctor}
        patientData={patientData}
        slot={slotParam}
        date={appointmentDate}
        onBack={() => setStep(1)}
        onConfirm={handleConfirmPayment}
        loading={loading}
      />
    );
  }

  return (
    <SuccessModal
      doctor={doctor}
      patientData={patientData}
      slot={slotParam}
      date={appointmentDate}
      appointmentId={appointmentId}
      onNavigate={navigate}
    />
  );
}
