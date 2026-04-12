import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  MapPin, ChevronRight, CalendarDays, X,
  ArrowUpDown, SlidersHorizontal, Plus,
} from 'lucide-react';
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
  if (isToday(d))    return `Aujourd'hui, ${format(d, 'd MMMM yyyy', { locale: fr })}`;
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
  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden mb-2">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar rond */}
          <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 40 40" fill="#2db87a" className="w-8 h-8 opacity-70">
              <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm-2 22h-4V14h4v12zm8 0h-4V14h4v12z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">
              {appt.patient ? `${appt.patient.prenom} ${appt.patient.nom}` : 'Patient'}
            </p>
            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
              Dr {appt.doctor?.prenom} {appt.doctor?.nom}
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-muted">{appt.doctor?.specialite}</p>
          </div>
          {appt.scheduledAt && (
            <p className="text-xs font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
              {format(parseISO(appt.scheduledAt), 'HH:mm')}
            </p>
          )}
        </div>

        {appt.payment && (
          <p className="text-sm font-bold text-primary-500 mt-2.5">
            {appt.payment.amount?.toLocaleString('fr-FR')} FCFA
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-1.5">
          <MapPin size={13} color="#2db87a" strokeWidth={2} />
          <span className="text-xs text-gray-500 dark:text-dark-muted">Clinique TéléMéd Congo</span>
        </div>

        <Link
          to={`/appointments/${appt.id}`}
          className="flex items-center gap-1 text-xs text-primary-500 font-semibold mt-1.5"
        >
          Détail du rendez-vous
          <ChevronRight size={13} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Actions pour CONFIRMED */}
      {appt.status === 'CONFIRMED' && (
        <div className="border-t border-gray-100 dark:border-dark-border p-3 flex flex-col gap-2">
          <button
            onClick={() => onReschedule(appt.id)}
            className="w-full py-2.5 rounded-pill border border-amber-400 text-amber-500 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <CalendarDays size={16} strokeWidth={2} />
            Reporter le rendez-vous
          </button>
          <button
            onClick={() => onCancel(appt.id)}
            className="w-full py-2.5 rounded-pill border border-red-400 text-red-500 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <X size={16} strokeWidth={2} />
            Annuler le rendez-vous
          </button>
        </div>
      )}

      {/* Répéter (COMPLETED) */}
      {appt.status === 'COMPLETED' && (
        <div className="border-t border-gray-100 dark:border-dark-border p-3">
          <button
            onClick={() => onReschedule(appt.id)}
            className="btn-sm w-full justify-center"
          >
            <Plus size={15} strokeWidth={2.5} />
            Répéter ce rendez-vous
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
      toast.error("Erreur lors de l'annulation");
    }
  }

  function handleReschedule() {
    navigate('/doctors');
  }

  const groups = groupByDate(appointments);

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* Chips filtre + tri */}
      <div className="bg-white dark:bg-dark-surface px-4 pt-4 pb-3 border-b border-gray-100 dark:border-dark-border">
        <div className="flex items-center gap-2 mb-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-gray-200 dark:border-dark-border text-xs font-medium text-gray-500 dark:text-dark-muted">
            <ArrowUpDown size={13} strokeWidth={2} />
            Trier
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-gray-200 dark:border-dark-border text-xs font-medium text-gray-500 dark:text-dark-muted">
            <SlidersHorizontal size={13} strokeWidth={2} />
            Filtrer
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2">
          {STATUTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setActiveTab(s.value)}
              className={`chip ${activeTab === s.value ? 'chip-active' : 'chip-inactive'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 pb-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="bg-white dark:bg-dark-card rounded-2xl h-32 animate-pulse" />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center">
              <CalendarDays size={30} color="#2db87a" strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 dark:text-dark-muted text-sm text-center">
              Aucun rendez-vous dans cette catégorie
            </p>
            <button onClick={() => navigate('/doctors')} className="btn-primary max-w-xs">
              <Plus size={18} />
              Prendre rendez-vous
            </button>
          </div>
        ) : (
          groups.map((group, gi) => (
            <div key={gi} className="mb-4">
              <div className="bg-primary-500/10 dark:bg-primary-500/5 rounded-2xl px-4 py-2.5 mb-2 border border-primary-500/20">
                <p className="text-xs font-bold text-primary-500 capitalize">{group.label}</p>
              </div>
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
      </div>

      {/* Bouton flottant */}
      <div className="fixed bottom-20 right-4 z-30">
        <button
          onClick={() => navigate('/doctors')}
          className="w-14 h-14 rounded-full bg-primary-500 shadow-lg flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus size={26} color="white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
