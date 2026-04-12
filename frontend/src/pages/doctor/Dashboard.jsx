import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Clock, CircleDollarSign,
  LayoutGrid, DollarSign, Users, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import AppointmentCard from '../../components/common/AppointmentCard';

export default function DoctorDashboard() {
  const { user, setUser } = useAuthStore();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [toggling, setToggling] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, earnings: 0 });
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
        setStats({ total: apptRes.data.total, pending: apptRes.data.appointments.length, earnings });
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
      toast.success(data.isAvailableNow ? 'Vous êtes maintenant en ligne' : 'Vous êtes hors ligne');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setToggling(false);
    }
  }

  const statCards = [
    {
      label: 'RDV total', value: stats.total,
      Icon: CalendarDays, iconColor: '#2db87a', bg: 'bg-primary-500/10',
    },
    {
      label: 'En attente', value: stats.pending,
      Icon: Clock, iconColor: '#f59e0b', bg: 'bg-amber-500/10',
    },
    {
      label: 'Gains (F)', value: (stats.earnings || 0).toLocaleString('fr-FR'),
      Icon: CircleDollarSign, iconColor: '#2db87a', bg: 'bg-primary-500/10',
    },
  ];

  const quickLinks = [
    { label: 'Disponibilités', path: '/doctor/availabilities', Icon: LayoutGrid,  iconColor: '#2db87a', bg: 'bg-primary-500/10' },
    { label: 'Mes gains',      path: '/doctor/earnings',       Icon: DollarSign,  iconColor: '#2db87a', bg: 'bg-primary-500/10' },
    { label: 'Mes patients',   path: '/doctor/patients',       Icon: Users,       iconColor: '#3b82f6', bg: 'bg-blue-500/10' },
    { label: 'Abonnement',     path: '/doctor/subscription',   Icon: FileText,    iconColor: '#f59e0b', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* Header */}
      <div className="header-gradient px-4 pt-3 pb-5 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white">
              Dr {doctor?.prenom} {doctor?.nom}
            </h2>
            <p className="text-white/80 text-sm">{doctor?.specialite}</p>
          </div>
          <button
            onClick={toggleOnline}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-bold transition-colors ${
              doctor?.isAvailableNow
                ? 'bg-white text-primary-500'
                : 'bg-white/20 text-white border border-white/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${doctor?.isAvailableNow ? 'bg-primary-500' : 'bg-white/60'}`} />
            {toggling ? '…' : doctor?.isAvailableNow ? 'En ligne' : 'Hors ligne'}
          </button>
        </div>
        {!doctor?.subscriptionActive && (
          <Link
            to="/doctor/subscription"
            className="block bg-amber-400 text-amber-900 font-bold text-center py-2.5 rounded-2xl text-sm relative z-10"
          >
            Activer l'abonnement (20 000 FCFA/mois)
          </Link>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-3 text-center">
              <div className={`w-11 h-11 rounded-2xl mx-auto mb-2 flex items-center justify-center ${s.bg}`}>
                <s.Icon size={22} color={s.iconColor} strokeWidth={1.8} />
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-dark-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Consultations à venir */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wide">
              Consultations à venir
            </h3>
            <Link to="/doctor/appointments" className="text-xs text-primary-500 font-semibold">Voir tout</Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="bg-white dark:bg-dark-card h-20 rounded-2xl animate-pulse" />)}
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 text-center">
              <CalendarDays size={32} color="#2db87a" strokeWidth={1.5} className="mx-auto mb-2 opacity-50" />
              <p className="text-gray-500 dark:text-dark-muted text-sm">Aucune consultation à venir</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppointments.map((a) => <AppointmentCard key={a.id} appointment={a} role="DOCTOR" />)}
            </div>
          )}
        </div>

        {/* Liens rapides */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wide mb-3">
            Accès rapides
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex flex-col items-center gap-2.5 active:scale-95 transition-transform"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}>
                  <item.Icon size={24} color={item.iconColor} strokeWidth={1.8} />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
