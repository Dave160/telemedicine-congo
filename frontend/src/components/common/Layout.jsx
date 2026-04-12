import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { useNotifications } from '../../hooks/useNotifications';

/* ── Icônes SVG légères ── */
const HomeIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : 'currentColor'} strokeWidth="1.8" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
  </svg>
);
const FolderIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : 'currentColor'} strokeWidth="1.8" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M5 3h4l2 2h8a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
    <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
const UserIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : 'currentColor'} strokeWidth="1.8" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const ChatIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : 'currentColor'} strokeWidth="1.8" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const CalendarIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : 'currentColor'} strokeWidth="1.8" className="w-6 h-6">
    <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const GridIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : 'currentColor'} strokeWidth="1.8" className="w-6 h-6">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const UsersIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : 'currentColor'} strokeWidth="1.8" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const StethoscopeIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : 'currentColor'} strokeWidth="1.8" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H7a2 2 0 00-2 2v4a6 6 0 0012 0V5a2 2 0 00-2-2h-2M9 3v2m6-2v2M12 16v2m0 0a3 3 0 103 3m-3-3a3 3 0 00-3 3" />
  </svg>
);
const CreditCardIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : 'currentColor'} strokeWidth="1.8" className="w-6 h-6">
    <rect x="2" y="5" width="20" height="14" rx="2" /><path strokeLinecap="round" d="M2 10h20" />
  </svg>
);
const ArticleIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill={active ? '#22c55e' : 'none'} stroke={active ? '#22c55e' : 'currentColor'} strokeWidth="1.8" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

/* ── Configs nav ── */
const patientNav = [
  { path: '/dashboard',       label: 'Accueil',        Icon: HomeIcon },
  { path: '/medical-record',  label: 'Dossier',        Icon: FolderIcon },
  { path: '/doctors',         label: 'Rendez-vous',    Icon: null, plus: true },
  { path: '/profile',         label: 'Profil',         Icon: UserIcon },
  { path: '/conversations',   label: 'Chat',           Icon: ChatIcon },
];

const doctorNav = [
  { path: '/doctor/dashboard',      label: 'Accueil',      Icon: HomeIcon },
  { path: '/doctor/appointments',   label: 'Consultations', Icon: CalendarIcon },
  { path: '/doctor/patients',       label: 'Patients',     Icon: UsersIcon },
  { path: '/doctor/availabilities', label: 'Agenda',       Icon: GridIcon },
  { path: '/doctor/profile',        label: 'Profil',       Icon: UserIcon },
];

const adminNav = [
  { path: '/admin/dashboard', label: 'Stats',        Icon: GridIcon },
  { path: '/admin/users',     label: 'Utilisateurs', Icon: UsersIcon },
  { path: '/admin/doctors',   label: 'Médecins',     Icon: StethoscopeIcon },
  { path: '/admin/payments',  label: 'Paiements',    Icon: CreditCardIcon },
  { path: '/profile',         label: 'Profil',       Icon: UserIcon },
];

export default function Layout({ children }) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const navItems =
    user?.role === 'ADMIN' ? adminNav :
    user?.role === 'DOCTOR' ? doctorNav : patientNav;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const patientName = user?.patient
    ? `${user.patient.prenom} ${user.patient.nom}`
    : user?.doctor
    ? `Dr ${user.doctor.prenom} ${user.doctor.nom}`
    : 'TéléMéd Congo';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col max-w-md mx-auto relative">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-primary-500 px-4 pt-3 pb-3 flex items-center justify-between sticky top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
          <span className="font-bold text-white text-base leading-tight">TéléMéd<br/><span className="text-xs font-medium opacity-90">Congo</span></span>
        </div>

        {/* Cloche notifications */}
        <Link to="/notifications" className="relative p-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </header>

      {/* ── Contenu principal ────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24">{children}</main>

      {/* ── Bottom nav ──────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-dark-border flex z-40">
        {navItems.map((item) => {
          const active = isActive(item.path);

          if (item.plus) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex-1 flex flex-col items-center justify-center py-2"
              >
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center shadow-lg -mt-4">
                  <PlusIcon />
                </div>
                <span className={`text-[10px] mt-1 font-medium ${active ? 'text-primary-500' : 'text-gray-400 dark:text-dark-muted'}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            >
              <item.Icon active={active} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary-500' : 'text-gray-400 dark:text-dark-muted'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
