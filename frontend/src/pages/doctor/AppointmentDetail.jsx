import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showPrescForm, setShowPrescForm] = useState(false);
  const [prescForm, setPrescForm] = useState({ content: '', deliveryMethod: 'APP' });
  const [savingPresc, setSavingPresc] = useState(false);

  useEffect(() => {
    api.get(`/appointments/${id}`)
      .then(({ data }) => setAppointment(data))
      .catch(() => toast.error('Consultation introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  async function doAction(action) {
    setActing(true);
    try {
      await api.put(`/appointments/${id}/${action}`);
      const { data } = await api.get(`/appointments/${id}`);
      setAppointment(data);
      toast.success(
        action === 'confirm' ? 'Consultation confirmée' :
        action === 'complete' ? 'Consultation terminée' :
        action === 'cancel' ? 'Rendez-vous annulé' : 'Action effectuée'
      );
      if (action === 'cancel') navigate(-1);
    } catch {
      toast.error('Action impossible');
    } finally {
      setActing(false);
    }
  }

  async function createPrescription() {
    if (!prescForm.content.trim()) { toast.error('Contenu requis'); return; }
    setSavingPresc(true);
    try {
      await api.post('/prescriptions', { appointmentId: id, ...prescForm });
      toast.success('Ordonnance créée');
      setShowPrescForm(false);
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setSavingPresc(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-gray-500 dark:text-dark-muted">Rendez-vous introuvable</p>
        <button onClick={() => navigate(-1)} className="btn-primary max-w-xs">Retour</button>
      </div>
    );
  }

  const appt = appointment;
  const dateStr = appt.scheduledAt
    ? format(parseISO(appt.scheduledAt), 'EEEE d MMMM yyyy, HH:mm', { locale: fr })
    : 'Date non fixée';
  const isConfirmed = appt.status === 'CONFIRMED';
  const isCompleted = appt.status === 'COMPLETED';

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-screen">
      {/* Header */}
      <div className="bg-primary-500 px-4 pt-3 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
            <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-white font-bold text-base">Information sur le rendez-vous</h1>
        <button className="text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Patient */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border">
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Patient</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {appt.patient?.prenom} {appt.patient?.nom}
            </p>
          </div>

          {/* Médecin */}
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-xl flex-shrink-0">
              👨‍⚕️
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 dark:text-dark-muted">{appt.doctor?.specialite}</p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">
                Dr {appt.doctor?.prenom} {appt.doctor?.nom}
              </p>
              {appt.doctor?.experience && (
                <p className="text-xs text-gray-500 dark:text-dark-muted">
                  {appt.doctor.experience} ans d'expérience
                </p>
              )}
            </div>
            <button className="p-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="w-5 h-5">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            </button>
          </div>

          {/* Tarif */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Coût préliminaire</p>
            <p className="text-primary-500 font-bold text-lg">
              {appt.payment?.amount?.toLocaleString('fr-FR') || appt.doctor?.tarif?.toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
              Le coût final est déterminé par le médecin selon les services rendus
            </p>
          </div>

          {/* Service */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Service</p>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Consultation médicale — {appt.doctor?.specialite}
              {appt.consultationType === 'VIDEO' ? ' (Vidéo)' :
               appt.consultationType === 'AUDIO' ? ' (Audio)' : ' (Chat)'}
            </p>
          </div>

          {/* Date */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Date et heure</p>
            <p className="font-bold text-gray-900 dark:text-white capitalize text-sm">{dateStr}</p>
            <button className="flex items-center gap-1.5 text-primary-500 text-xs font-medium mt-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              Ajouter au calendrier
            </button>
          </div>

          {/* Adresse */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Adresse</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              Clinique TéléMéd Congo
            </p>
            <button className="flex items-center gap-1.5 text-primary-500 text-xs font-medium mt-1">
              <svg viewBox="0 0 24 24" fill="#22c55e" className="w-3.5 h-3.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Voir l'itinéraire
            </button>
          </div>

          {/* Infos */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Informations du rendez-vous</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              En cas de retard, veuillez contacter le cabinet ou reporter votre rendez-vous.
            </p>
          </div>

          {/* Préparation */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Préparation</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Si vous avez des résultats d'examens antérieurs (échographie, scanner, etc.), veuillez les apporter lors de la consultation.
            </p>
            {isConfirmed && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                Si vous êtes en retard, nous vous demandons de{' '}
                <button className="text-primary-500 font-medium">reporter le rendez-vous</button>
              </p>
            )}
          </div>
        </div>

        {/* Actions médecin */}
        {isDoctor && (
          <div className="space-y-2">
            {appt.status === 'PENDING' && (
              <button
                onClick={() => doAction('confirm')}
                disabled={acting}
                className="btn-primary"
              >
                {acting ? '...' : 'Confirmer la consultation'}
              </button>
            )}
            {isConfirmed && (
              <>
                <Link
                  to={`/chat/${appt.conversation?.id}`}
                  className="btn-secondary text-center block"
                >
                  💬 Rejoindre le chat
                </Link>
                <button onClick={() => doAction('complete')} disabled={acting} className="btn-primary">
                  {acting ? '...' : 'Marquer comme terminée'}
                </button>
                <button
                  onClick={() => setShowPrescForm(!showPrescForm)}
                  className="w-full py-3 rounded-2xl border border-primary-500 text-primary-500 font-semibold text-sm"
                >
                  📋 Rédiger une ordonnance
                </button>
              </>
            )}
            {showPrescForm && (
              <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 space-y-3">
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Contenu de l'ordonnance..."
                  value={prescForm.content}
                  onChange={(e) => setPrescForm({ ...prescForm, content: e.target.value })}
                />
                <select
                  className="input-field"
                  value={prescForm.deliveryMethod}
                  onChange={(e) => setPrescForm({ ...prescForm, deliveryMethod: e.target.value })}
                >
                  <option value="APP">Dans l'application</option>
                  <option value="SMS">Par SMS</option>
                  <option value="WHATSAPP">Par WhatsApp</option>
                </select>
                <button onClick={createPrescription} disabled={savingPresc} className="btn-primary">
                  {savingPresc ? 'Envoi...' : 'Créer et envoyer'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Actions patient */}
        {!isDoctor && isConfirmed && (
          <div className="space-y-2">
            <button
              onClick={() => toast('Reporter un rendez-vous sera disponible prochainement', { icon: '📅' })}
              className="w-full py-3.5 bg-primary-500 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              Reporter le rendez-vous
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </button>
            <button
              onClick={() => { if (window.confirm('Annuler ce rendez-vous ?')) doAction('cancel'); }}
              disabled={acting}
              className="btn-danger"
            >
              {acting ? '...' : (
                <span className="flex items-center justify-center gap-2">
                  Annuler le rendez-vous
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
