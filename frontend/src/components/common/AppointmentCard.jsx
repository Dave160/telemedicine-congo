import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_STYLES = {
  PENDING:     'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  CONFIRMED:   'bg-primary-500/10 text-primary-500',
  IN_PROGRESS: 'bg-primary-500/20 text-primary-600 dark:text-primary-400',
  COMPLETED:   'bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-dark-muted',
  CANCELLED:   'bg-red-100 dark:bg-red-900/30 text-red-500',
};
const STATUS_LABELS = {
  PENDING: 'En attente', CONFIRMED: 'Confirmé', IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé', CANCELLED: 'Annulé',
};
const TYPE_LABELS = {
  IMMEDIATE: 'Immédiat', SCHEDULED: 'Planifié', PHYSICAL: 'Physique',
};

export default function AppointmentCard({ appointment, role = 'PATIENT' }) {
  const isPatient = role === 'PATIENT';
  const person = isPatient
    ? `Dr ${appointment.doctor?.prenom || ''} ${appointment.doctor?.nom || ''}`
    : `${appointment.patient?.prenom || ''} ${appointment.patient?.nom || ''}`;
  const sub = isPatient ? appointment.doctor?.specialite : null;

  return (
    <Link
      to={`/appointments/${appointment.id}`}
      className="flex items-start gap-3 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 hover:shadow-sm transition-shadow"
    >
      {/* Avatar */}
      <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 40 40" fill="#22c55e" className="w-7 h-7 opacity-60">
          <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm-2 22h-4V14h4v12zm8 0h-4V14h4v12z"/>
        </svg>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{person}</p>
          <span className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[appointment.status]}`}>
            {STATUS_LABELS[appointment.status]}
          </span>
        </div>
        {sub && <p className="text-xs text-gray-400 dark:text-dark-muted mb-1">{sub}</p>}
        <div className="flex items-center gap-2 flex-wrap">
          {appointment.type && (
            <span className="text-xs text-gray-500 dark:text-dark-muted">
              {appointment.type === 'PHYSICAL' ? '🏥' : appointment.type === 'IMMEDIATE' ? '⚡' : '📅'} {TYPE_LABELS[appointment.type]}
            </span>
          )}
          {appointment.scheduledAt && (
            <span className="text-xs text-gray-400 dark:text-dark-muted">
              {format(new Date(appointment.scheduledAt), 'd MMM yyyy · HH:mm', { locale: fr })}
            </span>
          )}
        </div>
        {appointment.payment && (
          <p className="text-xs mt-1">
            <span className="text-gray-500 dark:text-dark-muted">
              {appointment.payment.amount?.toLocaleString('fr-FR')} FCFA —{' '}
            </span>
            <span className={appointment.payment.status === 'COMPLETED'
              ? 'text-primary-500 font-medium'
              : 'text-amber-500 font-medium'}>
              {appointment.payment.status === 'COMPLETED' ? 'Payé' : 'En attente'}
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
