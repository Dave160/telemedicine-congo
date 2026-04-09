import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import AppointmentCard from '../../components/common/AppointmentCard';

export default function DoctorDashboard() {
  const { user, setUser } = useAuthStore();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [toggling, setToggling] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);

  const doctor = user?.doctor;

  useEffect(() => {
    Promise.all([
      api.get('/appointments?status=CONFIRMED&limit=5'),
      api.get('/payments/history'),
    ])
      .then(([apptRes, payRes]) => {
        setTodayAppointments(apptRes.data.appointments);
        const payments = payRes.data.filter((p) => p.status === 'COMPLETED');
        const earnings = payments.reduce((sum, p) => sum + (p.doctorAmount || 0), 0);
        setStats({ total: apptRes.data.total, completed: 0, earnings });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleOnline() {
    if (!doctor?.subscriptionActive) {
      toast.error('Activez votre abonnement pour changer de statut');
      return;
    }
    setToggling(true);
    try {
      const { data } = await api.put('/doctors/status/toggle');
      setUser({ ...user, doctor: { ...doctor, isAvailableNow: data.isAvailableNow } });
      toast.success(data.isAvailableNow ? 'Vous êtes maintenant en ligne ✓' : 'Vous êtes hors ligne');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="bg-primary-500 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Dr {doctor?.prenom} {doctor?.nom}
            </h2>
            <p className="text-primary-100 text-sm">{doctor?.specialite}</p>
          </div>
          <button
            onClick={toggleOnline}
            disabled={toggling}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              doctor?.isAvailableNow ? 'bg-green-400 text-white' : 'bg-white/20 text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${doctor?.isAvailableNow ? 'bg-white' : 'bg-gray-300'}`} />
            {toggling ? '...' : doctor?.isAvailableNow ? 'En ligne' : 'Hors ligne'}
          </button>
        </div>

        {!doctor?.subscriptionActive && (
          <Link
            to="/doctor/subscription"
            className="mt-3 block bg-yellow-400 text-yellow-900 font-semibold text-center py-2 rounded-xl text-sm"
          >
            ⚠️ Activer l'abonnement (20 000 FCFA/mois)
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'RDV', value: stats.total, icon: '📅' },
          { label: 'Ce mois', value: todayAppointments.length, icon: '✅' },
          { label: 'Gains', value: `${stats.earnings?.toLocaleString()} F`, icon: '💰' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <span className="text-2xl block mb-1">{s.icon}</span>
            <p className="font-bold text-gray-900 text-sm">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Prochaines consultations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Consultations à venir</h3>
          <Link to="/doctor/appointments" className="text-sm text-primary-600">Voir tout</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="card h-20 bg-gray-100 animate-pulse" />)}</div>
        ) : todayAppointments.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-gray-500 text-sm">Aucune consultation à venir</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((a) => <AppointmentCard key={a.id} appointment={a} role="DOCTOR" />)}
          </div>
        )}
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '🗓️', label: 'Mes disponibilités', path: '/doctor/availabilities' },
          { icon: '💰', label: 'Mes gains', path: '/doctor/earnings' },
        ].map((item) => (
          <Link key={item.path} to={item.path} className="card text-center py-4">
            <span className="text-3xl block mb-1">{item.icon}</span>
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
