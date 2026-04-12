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
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* Header */}
      <div className="bg-primary-500 px-4 pt-4 pb-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-white">
              Dr {doctor?.prenom} {doctor?.nom}
            </h2>
            <p className="text-white/80 text-sm">{doctor?.specialite}</p>
          </div>
          <button
            onClick={toggleOnline}
            disabled={toggling}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              doctor?.isAvailableNow ? 'bg-white text-primary-500' : 'bg-white/20 text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${doctor?.isAvailableNow ? 'bg-primary-500' : 'bg-white/60'}`} />
            {toggling ? '...' : doctor?.isAvailableNow ? 'En ligne' : 'Hors ligne'}
          </button>
        </div>
        {!doctor?.subscriptionActive && (
          <Link
            to="/doctor/subscription"
            className="block bg-amber-400 text-amber-900 font-semibold text-center py-2.5 rounded-xl text-sm"
          >
            ⚠️ Activer l'abonnement (20 000 FCFA/mois)
          </Link>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'RDV total', value: stats.total,
              bg: '#22c55e20', color: '#22c55e',
              svg: <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>
            },
            {
              label: 'En attente', value: todayAppointments.length,
              bg: '#f59e0b20', color: '#f59e0b',
              svg: <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>
            },
            {
              label: 'Gains (F)', value: (stats.earnings || 0).toLocaleString('fr-FR'),
              bg: '#22c55e20', color: '#22c55e',
              svg: <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v2m0 8v2M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5m0 1h.01"/></svg>
            },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-3 text-center">
              <div className="w-11 h-11 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                {s.svg}
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-dark-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Prochaines consultations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Consultations à venir</h3>
            <Link to="/doctor/appointments" className="text-xs text-primary-500 font-semibold">Voir tout</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="bg-white dark:bg-dark-card h-20 rounded-2xl animate-pulse" />)}</div>
          ) : todayAppointments.length === 0 ? (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 text-center">
              <p className="text-gray-500 dark:text-dark-muted text-sm">Aucune consultation à venir</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppointments.map((a) => <AppointmentCard key={a.id} appointment={a} role="DOCTOR" />)}
            </div>
          )}
        </div>

        {/* Liens rapides */}
        {(() => {
          const quickLinks = [
            {
              label: 'Disponibilités', path: '/doctor/availabilities',
              bg: '#22c55e20',
              svg: <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" className="w-7 h-7"><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
            },
            {
              label: 'Mes gains', path: '/doctor/earnings',
              bg: '#22c55e20',
              svg: <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            },
            {
              label: 'Mes patients', path: '/doctor/patients',
              bg: '#3b82f620',
              svg: <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            },
            {
              label: 'Abonnement', path: '/doctor/subscription',
              bg: '#f59e0b20',
              svg: <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            },
          ];
          return (
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex flex-col items-center gap-2 hover:shadow-sm transition-shadow"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                    {item.svg}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center">{item.label}</span>
                </Link>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
