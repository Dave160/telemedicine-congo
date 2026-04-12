import { Link, useLocation } from 'react-router-dom';
import {
  Home, FileText, Plus, User, MessageCircle,
  Calendar, Users, LayoutGrid, CreditCard, UserCog,
  BarChart2, Bell,
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { useNotifications } from '../../hooks/useNotifications';

/* ── Configs nav ── */
const patientNav = [
  { path: '/dashboard',       label: 'Accueil',     Icon: Home },
  { path: '/medical-record',  label: 'Dossier',     Icon: FileText },
  { path: '/doctors',         label: 'RDV',         Icon: null, plus: true },
  { path: '/profile',         label: 'Profil',      Icon: User },
  { path: '/conversations',   label: 'Messages',    Icon: MessageCircle },
];

const doctorNav = [
  { path: '/doctor/dashboard',      label: 'Accueil',       Icon: Home },
  { path: '/doctor/appointments',   label: 'Consultations', Icon: Calendar },
  { path: '/doctor/patients',       label: 'Patients',      Icon: Users },
  { path: '/doctor/availabilities', label: 'Agenda',        Icon: LayoutGrid },
  { path: '/doctor/profile',        label: 'Profil',        Icon: User },
];

const adminNav = [
  { path: '/admin/dashboard', label: 'Stats',        Icon: BarChart2 },
  { path: '/admin/users',     label: 'Utilisateurs', Icon: Users },
  { path: '/admin/doctors',   label: 'Médecins',     Icon: UserCog },
  { path: '/admin/payments',  label: 'Paiements',    Icon: CreditCard },
  { path: '/profile',         label: 'Profil',       Icon: User },
];

export default function Layout({ children }) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const navItems =
    user?.role === 'ADMIN'  ? adminNav  :
    user?.role === 'DOCTOR' ? doctorNav : patientNav;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col max-w-md mx-auto relative">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="header-gradient px-4 pt-safe pt-3 pb-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white/25 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">TéléMéd Congo</p>
            <p className="text-white/70 text-[10px] mt-0.5">Votre santé, notre priorité</p>
          </div>
        </div>

        <Link to="/notifications" className="relative p-1.5 rounded-xl bg-white/15 active:bg-white/25">
          <Bell size={20} color="white" strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </header>

      {/* ── Contenu principal ──────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24">{children}</main>

      {/* ── Bottom nav ────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-dark-border flex z-40">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const color = active ? '#2db87a' : '#8a9a9a';

          if (item.plus) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex-1 flex flex-col items-center justify-center py-2"
              >
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center shadow-lg -mt-5">
                  <Plus size={26} color="white" strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] mt-0.5 font-medium ${active ? 'text-primary-500' : 'text-gray-400 dark:text-dark-muted'}`}>
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
              <item.Icon size={22} color={color} strokeWidth={1.8} />
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
