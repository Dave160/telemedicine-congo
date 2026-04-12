import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  MapPin, Bell, FlaskConical, CalendarDays, FileText,
  ChevronRight, Search, Heart, Plus,
} from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const FAQS = [
  'Comment prendre un rendez-vous en ligne ?',
  'Comment annuler ou reporter un rendez-vous ?',
  'Quels modes de paiement sont acceptés ?',
  'Comment accéder à mes ordonnances ?',
];

function generateCardNumber(userId) {
  const base = userId ? userId.substring(0, 8).toUpperCase().replace(/-/g, '') : 'TC000000';
  return `TC-${base.substring(0, 3)}-${base.substring(3, 6)}`;
}

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  const patient = user?.patient;
  const patientName = patient
    ? `${patient.prenom} ${patient.nom}`.toUpperCase()
    : 'MON COMPTE';
  const cardNumber = generateCardNumber(user?.id);

  useEffect(() => {
    api.get('/articles?limit=5').then(({ data }) => setArticles(data.articles || [])).catch(() => {});
    api.get('/appointments?status=CONFIRMED&limit=3').then(({ data }) => setUpcomingAppointments(data.appointments || [])).catch(() => {});
  }, []);

  const quickActions = [
    {
      icon: <FlaskConical size={24} color="#2db87a" strokeWidth={1.8} />,
      label: 'Analyses &\nExamens',
      path: '/analyses',
      bg: 'bg-primary-500/10',
    },
    {
      icon: <CalendarDays size={24} color="#2db87a" strokeWidth={1.8} />,
      label: 'Mes rendez-\nvous',
      path: '/appointments',
      bg: 'bg-primary-500/10',
    },
    {
      icon: <FileText size={24} color="#2db87a" strokeWidth={1.8} />,
      label: 'Mes\nordonnances',
      path: '/prescriptions',
      bg: 'bg-primary-500/10',
    },
    {
      icon: <Heart size={24} color="#ef4444" strokeWidth={1.8} />,
      label: 'Mes\nfavoris',
      path: '/medical-record',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* ── Hero vert ──────────────────────────────────────── */}
      <div className="header-gradient px-4 pt-3 pb-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute bottom-0 -left-8 w-24 h-24 rounded-full bg-white/10" />

        {/* Ville + Cloche (row) */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <button className="flex items-center gap-1 text-white/80 text-sm">
            <MapPin size={14} strokeWidth={2} />
            <span>Brazzaville, Congo</span>
            <ChevronRight size={14} strokeWidth={2} />
          </button>
          <Link to="/notifications" className="relative p-1.5 rounded-xl bg-white/15">
            <Bell size={19} color="white" strokeWidth={1.8} />
          </Link>
        </div>

        {/* Barre de recherche */}
        <div
          className="flex items-center gap-2.5 bg-white/20 backdrop-blur-sm rounded-2xl px-3.5 py-3 mb-4 relative z-10 cursor-pointer"
          onClick={() => navigate('/doctors')}
        >
          <Search size={17} color="white" strokeWidth={2} />
          <span className="text-white/80 text-sm">Médecin, spécialité, service…</span>
        </div>

        {/* Carte patient */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/70 text-xs mb-0.5">Votre carte santé</p>
              <p className="text-white font-bold text-base">{patientName}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z"/>
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-white/60 text-[10px] mb-1">Numéro de carte</p>
              <p className="text-white font-mono font-bold text-sm tracking-wider">{cardNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xl">{upcomingAppointments.length}</p>
              <p className="text-white/70 text-xs">RDV à venir</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* ── Actions rapides ──────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wide mb-3">
            Comment puis-je vous aider ?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link
                key={a.path}
                to={a.path}
                className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex flex-col items-center gap-2.5 active:scale-95 transition-transform"
              >
                <div className={`w-12 h-12 rounded-2xl ${a.bg} flex items-center justify-center`}>
                  {a.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center whitespace-pre-line leading-snug">
                  {a.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Prendre RDV ──────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wide mb-3">
            Prendre rendez-vous
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { sessionStorage.setItem('bookingForSelf', 'true'); navigate('/doctors'); }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex flex-col items-center gap-2.5 active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                <Plus size={24} color="#2db87a" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center">Me programmer</span>
            </button>
            <button
              onClick={() => { sessionStorage.setItem('bookingForSelf', 'false'); navigate('/doctors'); }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex flex-col items-center gap-2.5 active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center">Programmer quelqu'un</span>
            </button>
          </div>
        </div>

        {/* ── Articles santé ───────────────────────────────── */}
        {articles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wide">Conseils santé</p>
              <Link to="/articles" className="text-xs text-primary-500 font-semibold flex items-center gap-1">
                Voir tout <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.id}`}
                  className="flex-shrink-0 w-44 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden active:scale-95 transition-transform"
                >
                  {article.imageUrl ? (
                    <img src={article.imageUrl} alt={article.title} className="w-full h-24 object-cover" />
                  ) : (
                    <div className="w-full h-24 header-gradient flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 opacity-80">
                        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z"/>
                      </svg>
                    </div>
                  )}
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-2 leading-tight">
                      {article.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── RDV à venir ──────────────────────────────────── */}
        {upcomingAppointments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wide">Prochains rendez-vous</p>
              <Link to="/appointments" className="text-xs text-primary-500 font-semibold flex items-center gap-1">
                Voir tout <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingAppointments.map((appt) => (
                <Link
                  key={appt.id}
                  to={`/appointments/${appt.id}`}
                  className="flex items-center gap-3 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-3.5 active:scale-95 transition-transform"
                >
                  <div className="w-11 h-11 rounded-2xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2db87a" strokeWidth="1.8" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H7a2 2 0 00-2 2v4a6 6 0 0012 0V5a2 2 0 00-2-2h-2M9 3v2m6-2v2M12 16v2m0 0a3 3 0 103 3m-3-3a3 3 0 00-3 3"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      Dr {appt.doctor?.prenom} {appt.doctor?.nom}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted">
                      {appt.scheduledAt
                        ? format(new Date(appt.scheduledAt), 'EEE d MMM · HH:mm', { locale: fr })
                        : 'Sur demande'}
                    </p>
                  </div>
                  <span className="badge-confirmed">Confirmé</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── FAQ ──────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wide mb-3">
            Questions fréquentes
          </p>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            {FAQS.map((q, i) => (
              <button key={i} className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-gray-50 dark:active:bg-dark-border/30 transition-colors">
                <span className="text-sm text-gray-700 dark:text-gray-200 pr-2">{q}</span>
                <ChevronRight size={16} color="#2db87a" strokeWidth={2} className="flex-shrink-0" />
              </button>
            ))}
            <button className="w-full px-4 py-3 text-center text-sm font-semibold text-primary-500">
              Toutes les questions
            </button>
          </div>
        </div>

        {/* Pied de page */}
        <div className="text-center pb-2">
          <button className="text-sm text-gray-400 dark:text-dark-muted">
            Politique de confidentialité
          </button>
        </div>
      </div>
    </div>
  );
}
