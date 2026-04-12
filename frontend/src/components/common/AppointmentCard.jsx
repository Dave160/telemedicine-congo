import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Stethoscope } from 'lucide-react';

const STATUS_STYLES = {
  PENDING:     'badge-pending',
  CONFIRMED:   'badge-confirmed',
  IN_PROGRESS: 'badge-progress',
  COMPLETED:   'badge-done',
  CANCELLED:   'badge-cancelled',
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
      className="flex items-start gap-3 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 active:scale-95 transition-transform"
    >
      {/* Avatar */}
      <div className="w-11 h-11 rounded-2xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
        <Stethoscope size={22} color="#2db87a" strokeWidth={1.8} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{person}</p>
          <span className={`flex-shrink-0 ${STATUS_STYLES[appointment.status] || 'badge-done'}`}>
            {STATUS_LABELS[appointment.status] || appointment.status}
          </span>
        </div>
        {sub && <p className="text-xs text-gray-400 dark:text-dark-muted mb-1">{sub}</p>}
        <div className="flex items-center gap-2 flex-wrap">
          {appointment.type && (
            <span className="text-xs text-gray-500 dark:text-dark-muted">
              {appointment.type === 'PHYSICAL' ? '🏥' : appointment.type === 'IMMEDIATE' ? '⚡' : '📅'}{' '}
              {TYPE_LABELS[appointment.type]}
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
            <span className={appointment.payment.status === 'COMPLETED' ? 'text-primary-500 font-semibold' : 'text-amber-500 font-semibold'}>
              {appointment.payment.status === 'COMPLETED' ? 'Payé' : 'En attente'}
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
