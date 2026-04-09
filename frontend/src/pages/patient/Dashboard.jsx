import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import AppointmentCard from '../../components/common/AppointmentCard';

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const patient = user?.patient;
  const greeting = patient ? `Bonjour, ${patient.prenom} 👋` : 'Bonjour 👋';

  useEffect(() => {
    Promise.all([
      api.get('/appointments?status=CONFIRMED&limit=3'),
      api.get('/doctors/available-now'),
    ])
      .then(([apptRes, docRes]) => {
        setUpcomingAppointments(apptRes.data.appointments);
        setAvailableDoctors(docRes.data.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 space-y-5">
      {/* Greeting */}
      <div className="bg-primary-500 rounded-2xl p-5 text-white">
        <h2 className="text-xl font-bold">{greeting}</h2>
        <p className="text-primary-100 text-sm mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
        <Link
          to="/doctors"
          className="mt-4 block bg-white text-primary-600 font-semibold text-center py-2.5 rounded-xl text-sm"
        >
          Consulter un médecin
        </Link>
      </div>

      {/* Consultation rapide */}
      {availableDoctors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">⚡ Disponibles maintenant</h3>
            <Link to="/doctors?available=true" className="text-sm text-primary-600">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {availableDoctors.map((doctor) => (
              <Link key={doctor.id} to={`/doctors/${doctor.id}`} className="card flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xl">👨‍⚕️</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Dr {doctor.prenom} {doctor.nom}</p>
                  <p className="text-xs text-gray-500">{doctor.specialite}</p>
                </div>
                <div className="ml-auto">
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    En ligne
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Prochains RDV */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">📅 Prochains rendez-vous</h3>
          <Link to="/appointments" className="text-sm text-primary-600">Voir tout</Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="card h-20 bg-gray-100 animate-pulse rounded-2xl" />)}
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-gray-500 text-sm">Aucun rendez-vous à venir</p>
            <Link to="/doctors" className="text-primary-600 font-semibold text-sm mt-2 block">
              Prendre rendez-vous
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} role="PATIENT" />
            ))}
          </div>
        )}
      </div>

      {/* Services rapides */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Mes services</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📋', label: 'Ordonnances', path: '/prescriptions' },
            { icon: '📰', label: 'Conseils santé', path: '/articles' },
            { icon: '💬', label: 'Mes messages', path: '/conversations' },
            { icon: '💳', label: 'Paiements', path: '/payments' },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="card text-center py-4 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl block mb-1">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
