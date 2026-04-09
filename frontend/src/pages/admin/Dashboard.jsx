import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-400">Chargement...</div>;

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Tableau de bord Admin</h2>

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Patients', value: stats.users.patients, icon: '👤', color: 'bg-blue-50' },
              { label: 'Médecins vérifiés', value: stats.users.verifiedDoctors, icon: '🩺', color: 'bg-green-50' },
              { label: 'Consultations totales', value: stats.appointments.total, icon: '📅', color: 'bg-purple-50' },
              { label: 'Ce mois', value: stats.appointments.thisMonth, icon: '📆', color: 'bg-orange-50' },
            ].map((s) => (
              <div key={s.label} className={`card ${s.color}`}>
                <span className="text-3xl block mb-2">{s.icon}</span>
                <p className="text-2xl font-bold text-gray-900">{s.value?.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-900 mb-3">Revenus plateforme</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Total</span>
                <span className="font-bold text-primary-600">{stats.revenue.total?.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Ce mois</span>
                <span className="font-bold text-green-600">{stats.revenue.thisMonth?.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {stats.users.pendingDoctors > 0 && (
            <div className="card bg-yellow-50 border-yellow-200">
              <p className="font-bold text-yellow-800">⚠️ {stats.users.pendingDoctors} médecin(s) en attente de validation</p>
              <a href="/admin/doctors" className="text-yellow-600 text-sm font-semibold mt-1 block">Valider →</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
