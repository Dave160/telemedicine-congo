import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function DoctorEarnings() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/history')
      .then(({ data }) => setPayments(data.payments || data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = payments.filter((p) => p.status === 'COMPLETED');
  const totalEarned = completed.reduce((sum, p) => sum + (p.doctorAmount || 0), 0);
  const totalGross = completed.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalFees = completed.reduce((sum, p) => sum + (p.platformFee || 0), 0);
  const thisMonth = completed.filter((p) => {
    const d = new Date(p.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyEarned = thisMonth.reduce((sum, p) => sum + (p.doctorAmount || 0), 0);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Mes revenus</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-primary-50 border border-primary-100">
          <p className="text-xs text-primary-600 font-medium mb-1">Ce mois</p>
          <p className="text-2xl font-bold text-primary-700">{monthlyEarned.toLocaleString()}</p>
          <p className="text-xs text-primary-500">FCFA</p>
        </div>
        <div className="card bg-green-50 border border-green-100">
          <p className="text-xs text-green-600 font-medium mb-1">Total gagné</p>
          <p className="text-2xl font-bold text-green-700">{totalEarned.toLocaleString()}</p>
          <p className="text-xs text-green-500">FCFA</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">Consultations payées</p>
          <p className="text-2xl font-bold text-gray-800">{completed.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">Commission plateforme</p>
          <p className="text-2xl font-bold text-gray-800">{totalFees.toLocaleString()}</p>
          <p className="text-xs text-gray-400">FCFA</p>
        </div>
      </div>

      {/* Transaction list */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Historique</h3>
        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="card h-14 bg-gray-100 animate-pulse" />)}</div>
        ) : payments.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-3xl mb-2">💳</p>
            <p className="text-gray-500">Aucune transaction</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {p.appointment?.patient?.prenom} {p.appointment?.patient?.nom || 'Patient'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.method === 'MTN_MONEY' ? '📱 MTN Money' : '📱 Airtel Money'}
                      {p.createdAt ? ` · ${new Date(p.createdAt).toLocaleDateString('fr-FR')}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${p.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                      +{(p.doctorAmount || 0).toLocaleString()} FCFA
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.status === 'COMPLETED' ? '✓ Reçu' : '⏳ En attente'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
