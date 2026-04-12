import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft, Share2, Heart, MapPin,
  CalendarPlus, MessageCircle, X, FileText, Check,
} from 'lucide-react';
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
  const [liked, setLiked] = useState(false);
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
        action === 'confirm'  ? 'Consultation confirmée' :
        action === 'complete' ? 'Consultation terminée'  :
        action === 'cancel'   ? 'Rendez-vous annulé'     : 'Action effectuée'
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

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-screen">
      {/* Header */}
      <div className="header-gradient px-4 pt-3 pb-5 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl bg-white/20">
          <ChevronLeft size={22} color="white" strokeWidth={2} />
        </button>
        <h1 className="text-white font-bold text-base">Rendez-vous</h1>
        <button className="p-1.5 rounded-xl bg-white/20">
          <Share2 size={19} color="white" strokeWidth={2} />
        </button>
      </div>

      <div className="px-4 -mt-2 pb-6 space-y-3">
        {/* Carte médecin */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 40 40" fill="#2db87a" className="w-9 h-9 opacity-70">
                <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm-2 22h-4V14h4v12zm8 0h-4V14h4v12z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
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
            <button onClick={() => setLiked(!liked)} className="p-1.5 flex-shrink-0">
              <Heart
                size={22}
                color={liked ? '#ef4444' : '#9ca3af'}
                fill={liked ? '#ef4444' : 'none'}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* Détails */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border">
          {/* Patient */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Patient</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              {appt.patient?.prenom} {appt.patient?.nom}
            </p>
          </div>

          {/* Tarif */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Coût préliminaire</p>
            <p className="text-primary-500 font-bold text-lg">
              {appt.payment?.amount?.toLocaleString('fr-FR') || appt.doctor?.tarif?.toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
              Coût final déterminé par le médecin
            </p>
          </div>

          {/* Service */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Service</p>
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
              Consultation — {appt.doctor?.specialite}
              {appt.consultationType === 'VIDEO' ? ' (Vidéo)' :
               appt.consultationType === 'AUDIO' ? ' (Audio)' : ' (Chat)'}
            </p>
          </div>

          {/* Date */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Date et heure</p>
            <p className="font-bold text-gray-900 dark:text-white capitalize text-sm">{dateStr}</p>
            <button className="flex items-center gap-1.5 text-primary-500 text-xs font-semibold mt-1.5">
              <CalendarPlus size={14} strokeWidth={2} />
              Ajouter au calendrier
            </button>
          </div>

          {/* Adresse */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Adresse</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">Clinique TéléMéd Congo</p>
            <button className="flex items-center gap-1.5 text-primary-500 text-xs font-semibold mt-1.5">
              <MapPin size={14} strokeWidth={2} />
              Voir l'itinéraire
            </button>
          </div>

          {/* Infos */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Informations</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              En cas de retard, veuillez contacter le cabinet ou reporter votre rendez-vous.
            </p>
          </div>

          {/* Préparation */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Préparation</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Si vous avez des résultats d'examens antérieurs, veuillez les apporter lors de la consultation.
            </p>
          </div>
        </div>

        {/* Actions médecin */}
        {isDoctor && (
          <div className="space-y-2">
            {appt.status === 'PENDING' && (
              <button onClick={() => doAction('confirm')} disabled={acting} className="btn-primary">
                <Check size={18} />
                {acting ? '…' : 'Confirmer la consultation'}
              </button>
            )}
            {isConfirmed && (
              <>
                <Link
                  to={`/chat/${appt.conversation?.id}`}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Rejoindre le chat
                </Link>
                <button onClick={() => doAction('complete')} disabled={acting} className="btn-primary">
                  <Check size={18} />
                  {acting ? '…' : 'Marquer comme terminée'}
                </button>
                <button
                  onClick={() => setShowPrescForm(!showPrescForm)}
                  className="w-full py-3.5 rounded-pill border border-primary-500 text-primary-500 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  Rédiger une ordonnance
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
                  {savingPresc ? 'Envoi…' : 'Créer et envoyer'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Actions patient */}
        {!isDoctor && isConfirmed && (
          <div className="space-y-2">
            <button
              onClick={() => toast('Reporter un RDV sera disponible prochainement', { icon: '📅' })}
              className="btn-primary"
            >
              <CalendarPlus size={18} />
              Reporter le rendez-vous
            </button>
            <button
              onClick={() => { if (window.confirm('Annuler ce rendez-vous ?')) doAction('cancel'); }}
              disabled={acting}
              className="btn-danger"
            >
              <X size={18} />
              {acting ? '…' : 'Annuler le rendez-vous'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
