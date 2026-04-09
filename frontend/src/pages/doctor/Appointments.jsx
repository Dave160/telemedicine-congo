import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AppointmentCard from '../../components/common/AppointmentCard';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  const STATUTS = [
    { value: 'PENDING', label: 'En attente' },
    { value: 'CONFIRMED', label: 'Confirmés' },
    { value: 'COMPLETED', label: 'Terminés' },
    { value: '', label: 'Tous' },
  ];

  useEffect(() => {
    setLoading(true);
    const params = status ? `?status=${status}` : '';
    api.get(`/appointments${params}`)
      .then(({ data }) => setAppointments(data.appointments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  async function confirmAppointment(id) {
    try {
      await api.put(`/appointments/${id}/confirm`);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CONFIRMED' } : a))
      );
      toast.success('Consultation confirmée');
    } catch {
      toast.error('Erreur');
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Mes consultations</h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
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
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card h-24 bg-gray-100 animate-pulse" />)}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">📅</p>
          <p className="text-gray-500">Aucune consultation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt.id}>
              <AppointmentCard appointment={appt} role="DOCTOR" />
              {appt.status === 'PENDING' && (
                <div className="flex gap-2 mt-1 px-1">
                  <button
                    onClick={() => confirmAppointment(appt.id)}
                    className="flex-1 bg-green-500 text-white text-xs font-semibold py-2 rounded-xl"
                  >
                    ✓ Confirmer
                  </button>
                  <Link
                    to={`/appointments/${appt.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 text-xs font-semibold py-2 rounded-xl text-center"
                  >
                    Voir détails
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
