import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUTS = [
  { value: 'PRET', label: 'Prêt' },
  { value: 'PAYE', label: 'Payé' },
  { value: 'EN_COURS', label: 'En cours' },
];

export default function Analyses() {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState(null);

  // Pour l'instant, aucune analyse n'est disponible (fonctionnalité future)
  const analyses = [];

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Analyses</h1>
      </div>

      {/* Filtres statut */}
      <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto">
        {/* Tri */}
        <button className="w-8 h-8 rounded-lg bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" d="M3 6h18M7 12h10M11 18h2"/>
          </svg>
        </button>
        {/* Filtre */}
        <button className="w-8 h-8 rounded-lg bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" d="M4 6h16M7 12h10M10 18h4"/>
          </svg>
        </button>
        {STATUTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setActiveStatus(activeStatus === s.value ? null : s.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              activeStatus === s.value
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white dark:bg-dark-card border-gray-100 dark:border-dark-border text-gray-600 dark:text-gray-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Contenu vide */}
      {analyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 px-8">
          <div className="w-20 h-20 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <svg viewBox="0 0 40 40" fill="#22c55e" className="w-12 h-12">
              <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm-2 22h-4V14h4v12zm8 0h-4V14h4v12z"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800 dark:text-white text-base mb-1">TéléMéd Congo</p>
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Vous n'avez pas encore d'analyses
            </p>
          </div>
          <button
            onClick={() => navigate('/doctors')}
            className="btn-primary max-w-xs flex items-center justify-center gap-2"
          >
            Prendre rendez-vous
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
              <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v8M8 12h8"/>
            </svg>
          </button>
        </div>
      ) : (
        <div className="p-4">
          {/* Liste des analyses */}
          {analyses.map((analyse) => (
            <div key={analyse.id} className="card mb-2">
              <p>{analyse.titre}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
