import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-400 dark:text-dark-muted">Chargement...</div>;

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tableau de bord</h2>

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Patients', value: stats.users.patients, icon: '👤' },
              { label: 'Médecins vérifiés', value: stats.users.verifiedDoctors, icon: '🩺' },
              { label: 'Consultations', value: stats.appointments.total, icon: '📅' },
              { label: 'Ce mois', value: stats.appointments.thisMonth, icon: '📆' },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4">
                <span className="text-3xl block mb-2">{s.icon}</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value?.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-dark-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Revenus plateforme</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-dark-muted text-sm">Total</span>
                <span className="font-bold text-primary-500">{stats.revenue.total?.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-dark-muted text-sm">Ce mois</span>
                <span className="font-bold text-primary-500">{stats.revenue.thisMonth?.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {stats.users.pendingDoctors > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <p className="font-bold text-amber-800 dark:text-amber-400 text-sm">
                ⚠️ {stats.users.pendingDoctors} médecin(s) en attente de validation
              </p>
              <a href="/admin/doctors" className="text-amber-600 dark:text-amber-400 text-xs font-semibold mt-1 block">
                Valider →
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
