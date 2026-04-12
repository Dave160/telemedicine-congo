import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, SlidersHorizontal, FlaskConical, Plus } from 'lucide-react';

const STATUTS = [
  { value: 'PRET',     label: 'Prêt' },
  { value: 'PAYE',     label: 'Payé' },
  { value: 'EN_COURS', label: 'En cours' },
];

export default function Analyses() {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState(null);
  const analyses = [];

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* Header */}
      <div className="header-gradient px-4 pt-4 pb-5">
        <h1 className="text-xl font-bold text-white">Analyses & Examens</h1>
        <p className="text-white/70 text-sm mt-0.5">Vos résultats d'examens</p>
      </div>

      {/* Filtres */}
      <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button className="w-9 h-9 rounded-xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border flex items-center justify-center flex-shrink-0">
          <ArrowUpDown size={15} color="#2db87a" strokeWidth={2} />
        </button>
        <button className="w-9 h-9 rounded-xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border flex items-center justify-center flex-shrink-0">
          <SlidersHorizontal size={15} color="#2db87a" strokeWidth={2} />
        </button>
        {STATUTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setActiveStatus(activeStatus === s.value ? null : s.value)}
            className={`chip flex-shrink-0 ${activeStatus === s.value ? 'chip-active' : 'chip-inactive'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* État vide */}
      {analyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 px-8">
          <div className="w-20 h-20 rounded-3xl bg-primary-500/10 flex items-center justify-center">
            <FlaskConical size={40} color="#2db87a" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800 dark:text-white text-base mb-1">TéléMéd Congo</p>
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Vous n'avez pas encore d'analyses
            </p>
          </div>
          <button onClick={() => navigate('/doctors')} className="btn-primary max-w-xs">
            <Plus size={18} />
            Prendre rendez-vous
          </button>
        </div>
      ) : (
        <div className="p-4">
          {analyses.map((analyse) => (
            <div key={analyse.id} className="card mb-2">
              <p className="text-sm text-gray-800 dark:text-white">{analyse.titre}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
