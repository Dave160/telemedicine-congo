import { useState, useEffect } from 'react';
import api from '../../services/api';
import AppointmentCard from '../../components/common/AppointmentCard';

const STATUTS = [
  { value: '', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmés' },
  { value: 'COMPLETED', label: 'Terminés' },
  { value: 'CANCELLED', label: 'Annulés' },
];

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = status ? `?status=${status}` : '';
    api.get(`/appointments${params}`)
      .then(({ data }) => setAppointments(data.appointments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Mes consultations</h2>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              status === s.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card h-24 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">📅</p>
          <p className="text-gray-500">Aucune consultation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => <AppointmentCard key={appt.id} appointment={appt} role="PATIENT" />)}
        </div>
      )}
    </div>
  );
}
