import { useState, useEffect } from 'react';
import api from '../../services/api';

const STATUS_COLORS = { COMPLETED: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700', FAILED: 'bg-red-100 text-red-600' };
const STATUS_LABELS = { COMPLETED: 'Réussi', PENDING: 'En attente', FAILED: 'Échoué' };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/admin/payments')
      .then(({ data }) => setPayments(data.payments || data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter ? payments.filter((p) => p.status === statusFilter) : payments;

  const totalRevenue = payments.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + (p.amount || 0), 0);
  const totalFees = payments.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + (p.platformFee || 0), 0);
  const totalDoctors = payments.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + (p.doctorAmount || 0), 0);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Paiements</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">Volume total</p>
          <p className="text-lg font-bold text-gray-900">{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400">FCFA</p>
        </div>
        <div className="card text-center bg-primary-50">
          <p className="text-xs text-primary-600 mb-1">Commission</p>
          <p className="text-lg font-bold text-primary-700">{totalFees.toLocaleString()}</p>
          <p className="text-xs text-primary-400">FCFA</p>
        </div>
        <div className="card text-center bg-green-50">
          <p className="text-xs text-green-600 mb-1">Médecins</p>
          <p className="text-lg font-bold text-green-700">{totalDoctors.toLocaleString()}</p>
          <p className="text-xs text-green-400">FCFA</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[{ v: '', l: 'Tous' }, { v: 'COMPLETED', l: 'Réussis' }, { v: 'PENDING', l: 'En attente' }, { v: 'FAILED', l: 'Échoués' }].map((s) => (
          <button
            key={s.v}
            onClick={() => setStatusFilter(s.v)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              statusFilter === s.v ? 'bg-primary-500 text-white border-primary-500' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            {s.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="card h-16 bg-gray-100 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-3xl mb-2">💳</p>
          <p className="text-gray-500">Aucun paiement</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {p.appointment?.patient?.prenom} {p.appointment?.patient?.nom || 'Patient'}
                    <span className="text-gray-400 font-normal"> → </span>
                    Dr {p.appointment?.doctor?.prenom} {p.appointment?.doctor?.nom || 'Médecin'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {p.method === 'MTN_MONEY' ? '📱 MTN Money' : '📱 Airtel Money'}
                    {p.phoneNumber ? ` · ${p.phoneNumber}` : ''}
                    {p.createdAt ? ` · ${new Date(p.createdAt).toLocaleDateString('fr-FR')}` : ''}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-500'}`}>
                  {STATUS_LABELS[p.status] || p.status}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50">
                <span>Total : <strong className="text-gray-800">{(p.amount || 0).toLocaleString()} FCFA</strong></span>
                <span>Plateforme : <strong className="text-primary-600">{(p.platformFee || 0).toLocaleString()} FCFA</strong></span>
                <span>Médecin : <strong className="text-green-600">{(p.doctorAmount || 0).toLocaleString()} FCFA</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
