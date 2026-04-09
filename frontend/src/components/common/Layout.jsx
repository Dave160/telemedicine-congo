import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { useNotifications } from '../../hooks/useNotifications';

const patientNav = [
  { path: '/dashboard', label: 'Accueil', icon: '🏠' },
  { path: '/doctors', label: 'Médecins', icon: '👨‍⚕️' },
  { path: '/appointments', label: 'RDV', icon: '📅' },
  { path: '/prescriptions', label: 'Ordonnances', icon: '📋' },
  { path: '/profile', label: 'Profil', icon: '👤' },
];

const doctorNav = [
  { path: '/doctor/dashboard', label: 'Accueil', icon: '🏠' },
  { path: '/doctor/appointments', label: 'Consultations', icon: '📅' },
  { path: '/doctor/patients', label: 'Patients', icon: '👥' },
  { path: '/doctor/availabilities', label: 'Agenda', icon: '🗓️' },
  { path: '/doctor/profile', label: 'Profil', icon: '👤' },
];

const adminNav = [
  { path: '/admin/dashboard', label: 'Stats', icon: '📊' },
  { path: '/admin/users', label: 'Utilisateurs', icon: '👥' },
  { path: '/admin/doctors', label: 'Médecins', icon: '🩺' },
  { path: '/admin/payments', label: 'Paiements', icon: '💰' },
  { path: '/admin/articles', label: 'Articles', icon: '📰' },
];

export default function Layout({ children }) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const navItems =
    user?.role === 'ADMIN' ? adminNav : user?.role === 'DOCTOR' ? doctorNav : patientNav;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="font-bold text-primary-600 text-lg">TéléMéd Congo</span>
        </div>
        <Link to="/notifications" className="relative p-2">
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex z-40">
        {navItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                active ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
