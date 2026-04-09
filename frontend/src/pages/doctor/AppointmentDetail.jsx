import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const STATUS_COLORS = { PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-gray-100 text-gray-600', CANCELLED: 'bg-red-100 text-red-600', IN_PROGRESS: 'bg-green-100 text-green-700' };
const STATUS_LABELS = { PENDING: 'En attente', CONFIRMED: 'Confirmé', COMPLETED: 'Terminé', CANCELLED: 'Annulé', IN_PROGRESS: 'En cours' };

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [prescForm, setPrescForm] = useState({ content: '', deliveryMethod: 'APP' });
  const [savingPresc, setSavingPresc] = useState(false);
  const [showPrescForm, setShowPrescForm] = useState(false);

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
      toast.success(action === 'confirm' ? 'Consultation confirmée' : action === 'complete' ? 'Consultation terminée' : 'Action effectuée');
    } catch {
      toast.error('Action impossible');
    } finally {
      setActing(false);
    }
  }

  async function createPrescription() {
    if (!prescForm.content.trim()) { toast.error('Contenu de l\'ordonnance requis'); return; }
    setSavingPresc(true);
    try {
      await api.post('/prescriptions', { appointmentId: id, ...prescForm });
      toast.success('Ordonnance créée et envoyée');
      setShowPrescForm(false);
      setPrescForm({ content: '', deliveryMethod: 'APP' });
      const { data } = await api.get(`/appointments/${id}`);
      setAppointment(data);
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setSavingPresc(false);
    }
  }

  if (loading) return <div className="p-4 text-center text-gray-400">Chargement...</div>;
  if (!appointment) return <div className="p-4 text-center text-gray-400">Introuvable</div>;

  const otherName = isDoctor
    ? `${appointment.patient?.prenom || ''} ${appointment.patient?.nom || ''}`.trim() || 'Patient'
    : `Dr ${appointment.doctor?.prenom || ''} ${appointment.doctor?.nom || ''}`.trim();
  const otherIcon = isDoctor ? '👤' : '👨‍⚕️';

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-primary-500 text-sm font-medium">
        ← Retour
      </button>

      {/* Contact card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl">{otherIcon}</div>
            <div>
              <p className="font-bold text-gray-900">{otherName}</p>
              {!isDoctor && <p className="text-xs text-gray-500">{appointment.doctor?.specialite}</p>}
              <p className="text-xs text-gray-400">{appointment.type === 'IMMEDIATE' ? '⚡ Immédiate' : appointment.type === 'SCHEDULED' ? '📅 Planifiée' : '🏥 Physique'} · {appointment.consultationType}</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[appointment.status]}`}>
            {STATUS_LABELS[appointment.status]}
          </span>
        </div>

        {appointment.scheduledAt && (
          <p className="text-sm text-gray-500 mb-2">
            📅 {format(new Date(appointment.scheduledAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        )}
        {appointment.notes && (
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{appointment.notes}</p>
        )}
      </div>

      {/* Paiement */}
      {appointment.payment && (
        <div className="card">
          <p className="font-semibold text-gray-800 mb-2">Paiement</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Montant</span>
            <span className="font-semibold">{appointment.payment.amount?.toLocaleString()} FCFA</span>
          </div>
          {isDoctor && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Votre part</span>
              <span className="font-semibold text-green-600">{appointment.payment.doctorAmount?.toLocaleString()} FCFA</span>
            </div>
          )}
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Méthode</span>
            <span>{appointment.payment.method === 'MTN_MONEY' ? '📱 MTN Money' : '📱 Airtel Money'}</span>
          </div>
          <div className={`mt-2 text-xs font-medium ${appointment.payment.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
            {appointment.payment.status === 'COMPLETED' ? '✓ Payé' : '⏳ En attente de paiement'}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {/* Doctor-only: confirm/refuse pending */}
        {isDoctor && appointment.status === 'PENDING' && (
          <div className="flex gap-2">
            <button
              onClick={() => doAction('confirm')}
              disabled={acting}
              className="flex-1 bg-green-500 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60"
            >
              ✓ Confirmer la consultation
            </button>
            <button
              onClick={() => doAction('cancel')}
              disabled={acting}
              className="flex-1 bg-red-100 text-red-600 font-semibold py-3 rounded-xl text-sm disabled:opacity-60"
            >
              ✗ Refuser
            </button>
          </div>
        )}

        {/* Patient-only: cancel pending */}
        {!isDoctor && appointment.status === 'PENDING' && (
          <button
            onClick={() => doAction('cancel')}
            disabled={acting}
            className="w-full border border-red-200 text-red-500 font-semibold py-3 rounded-xl text-sm disabled:opacity-60"
          >
            Annuler le rendez-vous
          </button>
        )}

        {(appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS') && (
          <>
            {appointment.conversation?.id && (
              <Link
                to={`/chat/${appointment.conversation.id}`}
                className="flex items-center justify-center gap-2 bg-primary-500 text-white font-semibold py-3 rounded-xl text-sm"
              >
                <span>💬</span> Ouvrir le chat
              </Link>
            )}
            {/* Doctor-only: write prescription + mark complete */}
            {isDoctor && (
              <>
                <button
                  onClick={() => setShowPrescForm(true)}
                  className="w-full bg-purple-100 text-purple-700 font-semibold py-3 rounded-xl text-sm"
                >
                  📋 Rédiger une ordonnance
                </button>
                <button
                  onClick={() => doAction('complete')}
                  disabled={acting}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm disabled:opacity-60"
                >
                  ✓ Marquer comme terminé
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Prescription form */}
      {showPrescForm && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900">Nouvelle ordonnance</p>
            <button onClick={() => setShowPrescForm(false)} className="text-gray-400 text-xl">✕</button>
          </div>

          <div>
            <label className="label">Contenu de l'ordonnance</label>
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Médicaments, posologie, durée du traitement..."
              value={prescForm.content}
              onChange={(e) => setPrescForm({ ...prescForm, content: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Mode d'envoi</label>
            <div className="flex gap-2">
              {[{ v: 'APP', l: '📱 Application' }, { v: 'SMS', l: '📲 SMS' }, { v: 'WHATSAPP', l: '💬 WhatsApp' }].map((m) => (
                <button
                  key={m.v}
                  onClick={() => setPrescForm({ ...prescForm, deliveryMethod: m.v })}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border-2 transition-colors ${
                    prescForm.deliveryMethod === m.v
                      ? 'bg-primary-50 border-primary-400 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  {m.l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createPrescription}
            disabled={savingPresc}
            className="btn-primary w-full disabled:opacity-60"
          >
            {savingPresc ? 'Envoi...' : 'Créer et envoyer'}
          </button>
        </div>
      )}

      {/* Existing prescriptions */}
      {appointment.prescriptions?.length > 0 && (
        <div className="card">
          <p className="font-semibold text-gray-800 mb-3">Ordonnances ({appointment.prescriptions.length})</p>
          {appointment.prescriptions.map((p) => (
            <div key={p.id} className="border border-gray-100 rounded-xl p-3 mb-2">
              <p className="text-sm text-gray-700 mb-2">{p.content}</p>
              {p.pdfUrl && (
                <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 font-medium">
                  📄 Télécharger PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
