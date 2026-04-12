import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const FAQS = [
  { q: 'Comment prendre un rendez-vous en ligne ?' },
  { q: 'Comment annuler ou reporter un rendez-vous ?' },
  { q: 'Quels modes de paiement sont acceptés ?' },
  { q: 'Comment accéder à mes ordonnances ?' },
];

const ACTIONS = [
  { icon: '🧪', label: 'Analyses &\nExamens', path: '/analyses' },
  { icon: '📅', label: 'Mes rendez-\nvous', path: '/appointments' },
  { icon: '📋', label: 'Mes\nordonnances', path: '/prescriptions' },
  { icon: '💬', label: 'Messages', path: '/conversations' },
];

function generateCardNumber(userId) {
  const base = userId ? userId.substring(0, 8).toUpperCase().replace(/-/g, '') : 'TC000000';
  return `TC${base.substring(0, 6)}`;
}

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselRef = useRef(null);

  const patient = user?.patient;
  const patientName = patient
    ? `${patient.prenom} ${patient.nom}`.toUpperCase()
    : 'MON COMPTE';
  const cardNumber = generateCardNumber(user?.id);

  useEffect(() => {
    api.get('/articles?limit=5').then(({ data }) => setArticles(data.articles || [])).catch(() => {});
    api.get('/appointments?status=CONFIRMED&limit=3').then(({ data }) => setUpcomingAppointments(data.appointments || [])).catch(() => {});
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* ── Carte patient ──────────────────────────────────────── */}
      <div className="bg-primary-500 px-4 pt-4 pb-6">
        {/* Barre de recherche */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex-1 flex items-center gap-2 bg-white dark:bg-dark-card rounded-xl px-3 py-2.5 cursor-pointer"
            onClick={() => navigate('/doctors')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="w-4 h-4">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <span className="text-gray-400 text-sm">Médecin, spécialité, service...</span>
          </div>
          <Link to="/prescriptions" className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
          </Link>
        </div>

        {/* Carte verte */}
        <div className="bg-white/15 rounded-2xl p-4">
          <p className="text-white font-bold text-base">{patientName}</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-white/70 text-xs mb-0.5">Votre carte</p>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded px-2 py-1">
                  <svg viewBox="0 0 60 20" className="w-10 h-4">
                    {[0,4,8,12,16,20,24,28,32,36,40,44,48,52].map(x => (
                      <rect key={x} x={x} y={2} width={2} height={16} fill="white" opacity={Math.random() > 0.4 ? 1 : 0.3}/>
                    ))}
                  </svg>
                </div>
                <span className="text-white font-mono text-sm font-bold">{cardNumber}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Consultations</p>
              <p className="text-white font-bold text-lg">{upcomingAppointments.length}</p>
              <p className="text-white/70 text-xs">à venir</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* ── Actions rapides ──────────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-gray-500 dark:text-dark-muted mb-3">Comment puis-je vous aider ?</p>
          <div className="grid grid-cols-2 gap-3">
            {ACTIONS.map((a) => (
              <Link
                key={a.path}
                to={a.path}
                className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex flex-col items-center gap-2 hover:shadow-sm transition-shadow"
              >
                <div className="w-11 h-11 rounded-full bg-primary-500/10 flex items-center justify-center text-xl">
                  {a.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center whitespace-pre-line leading-tight">
                  {a.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Prendre RDV ────────────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-gray-500 dark:text-dark-muted mb-3">Prendre rendez-vous</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { sessionStorage.setItem('bookingForSelf', 'true'); navigate('/doctors'); }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex flex-col items-center gap-2 hover:shadow-sm transition-shadow"
            >
              <div className="w-11 h-11 rounded-full bg-primary-500/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-6 h-6">
                  <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v8M8 12h8"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center">Me programmer</span>
            </button>
            <button
              onClick={() => { sessionStorage.setItem('bookingForSelf', 'false'); navigate('/doctors'); }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex flex-col items-center gap-2 hover:shadow-sm transition-shadow"
            >
              <div className="w-11 h-11 rounded-full bg-primary-500/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center">Programmer quelqu'un</span>
            </button>
          </div>
        </div>

        {/* ── Carrousel articles ────────────────────────────── */}
        {articles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500 dark:text-dark-muted">Conseils santé</p>
              <Link to="/articles" className="text-xs text-primary-500 font-semibold">Voir tout</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.id}`}
                  className="flex-shrink-0 w-44 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden"
                >
                  {article.imageUrl ? (
                    <img src={article.imageUrl} alt={article.title} className="w-full h-24 object-cover" />
                  ) : (
                    <div className="w-full h-24 bg-primary-500/10 flex items-center justify-center text-3xl">
                      🏥
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

        {/* ── RDV à venir ───────────────────────────────────── */}
        {upcomingAppointments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500 dark:text-dark-muted">Prochains rendez-vous</p>
              <Link to="/appointments" className="text-xs text-primary-500 font-semibold">Voir tout</Link>
            </div>
            <div className="space-y-2">
              {upcomingAppointments.map((appt) => (
                <Link
                  key={appt.id}
                  to={`/appointments/${appt.id}`}
                  className="flex items-center gap-3 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-xl">
                    👨‍⚕️
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
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-500/10 text-primary-500">
                    Confirmé
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── FAQ ───────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-gray-500 dark:text-dark-muted mb-3">Questions fréquentes</p>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            {FAQS.map((faq, i) => (
              <button
                key={i}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-200 pr-2">{faq.q}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
                  <path strokeLinecap="round" d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            ))}
            <button className="w-full px-4 py-3 text-center text-sm font-semibold text-primary-500">
              Toutes les questions
            </button>
          </div>
        </div>

        {/* ── Pied de page ──────────────────────────────────── */}
        <div className="text-center pb-2">
          <button className="text-sm text-primary-500 font-medium">
            Politique de confidentialité
          </button>
        </div>
      </div>
    </div>
  );
}
