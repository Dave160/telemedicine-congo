import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUTS = [
  { value: 'CONFIRMED', label: 'À venir' },
  { value: 'COMPLETED', label: 'Terminés' },
  { value: 'CANCELLED', label: 'Annulés' },
];

function dateGroupLabel(dateStr) {
  if (!dateStr) return 'Date à confirmer';
  const d = parseISO(dateStr);
  if (isToday(d)) return `Aujourd'hui, ${format(d, 'd MMMM yyyy', { locale: fr })}`;
  if (isTomorrow(d)) return `Demain, ${format(d, 'd MMMM yyyy', { locale: fr })}`;
  return format(d, 'EEEE d MMMM yyyy', { locale: fr });
}

function groupByDate(appointments) {
  const map = {};
  appointments.forEach((appt) => {
    const key = appt.scheduledAt
      ? format(parseISO(appt.scheduledAt), 'yyyy-MM-dd')
      : 'no-date';
    if (!map[key]) map[key] = { label: dateGroupLabel(appt.scheduledAt || null), items: [] };
    map[key].items.push(appt);
  });
  return Object.values(map);
}

function ApptCard({ appt, onCancel, onReschedule }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden mb-2">
      {/* En-tête */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-xl">
            👨‍⚕️
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">
              {appt.patient
                ? `${appt.patient.prenom} ${appt.patient.nom}`
                : 'Patient'}
            </p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              Dr {appt.doctor?.prenom} {appt.doctor?.nom}
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-muted">{appt.doctor?.specialite}</p>
          </div>
          <div className="text-right">
            {appt.scheduledAt && (
              <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted">
                {format(parseISO(appt.scheduledAt), 'HH:mm')}
              </p>
            )}
          </div>
        </div>

        {/* Prix + clinique */}
        {appt.payment && (
          <p className="text-sm font-bold text-primary-500 mt-2">
            {appt.payment.amount?.toLocaleString('fr-FR')} FCFA
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-1">
          <svg viewBox="0 0 24 24" fill="#22c55e" className="w-3.5 h-3.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <p className="text-xs text-gray-500 dark:text-dark-muted">
            Clinique TéléMéd Congo
          </p>
        </div>

        <Link
          to={`/appointments/${appt.id}`}
          className="block text-xs text-primary-500 font-medium mt-1"
        >
          Détail du rendez-vous →
        </Link>
      </div>

      {/* Boutons actions (uniquement CONFIRMED) */}
      {appt.status === 'CONFIRMED' && (
        <div className="border-t border-gray-100 dark:border-dark-border p-3 flex flex-col gap-2">
          <button
            onClick={() => onReschedule(appt.id)}
            className="w-full py-2.5 rounded-xl border border-amber-400 text-amber-500 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Reporter le rendez-vous
          </button>
          <button
            onClick={() => onCancel(appt.id)}
            className="w-full py-2.5 rounded-xl border border-red-400 text-red-500 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Annuler le rendez-vous
          </button>
        </div>
      )}
    </div>
  );
}

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('CONFIRMED');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/appointments?status=${activeTab}`)
      .then(({ data }) => setAppointments(data.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  async function handleCancel(id) {
    if (!window.confirm('Annuler ce rendez-vous ?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast.success('Rendez-vous annulé');
    } catch {
      toast.error('Erreur lors de l\'annulation');
    }
  }

  function handleReschedule(id) {
    toast('Fonctionnalité de report disponible prochainement', { icon: '📅' });
  }

  const groups = groupByDate(appointments);

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* Tabs */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border px-4 pt-3 pb-0 flex gap-0">
        {STATUTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setActiveTab(s.value)}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === s.value
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-400 dark:text-dark-muted'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-dark-card rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center text-3xl">
              📅
            </div>
            <p className="text-gray-500 dark:text-dark-muted text-sm">Aucun rendez-vous</p>
            <button
              onClick={() => navigate('/doctors')}
              className="btn-primary max-w-xs"
            >
              Prendre rendez-vous +
            </button>
          </div>
        ) : (
          groups.map((group, gi) => (
            <div key={gi} className="mb-4">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 capitalize">
                {group.label}
              </p>
              {group.items.map((appt) => (
                <ApptCard
                  key={appt.id}
                  appt={appt}
                  onCancel={handleCancel}
                  onReschedule={handleReschedule}
                />
              ))}
            </div>
          ))
        )}

        {appointments.length > 0 && (
          <button
            onClick={() => navigate('/doctors')}
            className="btn-primary mt-4"
          >
            Prendre un nouveau rendez-vous +
          </button>
        )}
      </div>
    </div>
  );
}
