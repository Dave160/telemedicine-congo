import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

const statusLabels = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

const typeLabels = {
  IMMEDIATE: '⚡ Immédiat',
  SCHEDULED: '📅 Planifié',
  PHYSICAL: '🏥 Physique',
};

export default function AppointmentCard({ appointment, role = 'PATIENT' }) {
  const otherPerson =
    role === 'PATIENT'
      ? `Dr ${appointment.doctor?.prenom} ${appointment.doctor?.nom}`
      : `${appointment.patient?.prenom} ${appointment.patient?.nom}`;

  return (
    <Link to={`/appointments/${appointment.id}`} className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-900">{otherPerson}</p>
          {role === 'PATIENT' && (
            <p className="text-sm text-gray-500">{appointment.doctor?.specialite}</p>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[appointment.status]}`}>
          {statusLabels[appointment.status]}
        </span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>{typeLabels[appointment.type]}</span>
        {appointment.scheduledAt && (
          <span>
            {format(new Date(appointment.scheduledAt), 'd MMM yyyy HH:mm', { locale: fr })}
          </span>
        )}
      </div>
      {appointment.payment && (
        <div className="mt-2 text-sm text-gray-500">
          💳 {appointment.payment.amount?.toLocaleString()} FCFA —{' '}
          <span className={appointment.payment.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}>
            {appointment.payment.status === 'COMPLETED' ? 'Payé' : 'En attente'}
          </span>
        </div>
      )}
    </Link>
  );
}
