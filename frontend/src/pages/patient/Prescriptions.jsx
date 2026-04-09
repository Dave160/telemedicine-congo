import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prescriptions/mine')
      .then(({ data }) => setPrescriptions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Mes ordonnances</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="card h-20 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-gray-500">Aucune ordonnance</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    Dr {p.appointment?.doctor?.prenom} {p.appointment?.doctor?.nom}
                  </p>
                  <p className="text-sm text-gray-500">{p.appointment?.doctor?.specialite}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {format(new Date(p.createdAt), 'd MMM yyyy', { locale: fr })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.content}</p>
              {p.pdfUrl && (
                <a
                  href={p.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-primary-50 text-primary-600 font-medium text-sm px-4 py-2 rounded-xl w-fit"
                >
                  📄 Télécharger le PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
