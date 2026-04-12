import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  {
    title: 'Données du dossier médical',
    items: [
      { icon: '🧪', label: 'Analyses', path: '/analyses', color: '#22c55e' },
      { icon: '🔬', label: 'Examens', path: '/analyses?type=examens', color: '#22c55e' },
    ],
  },
  {
    title: 'Rendez-vous',
    items: [
      {
        icon: null,
        svgType: 'clock',
        color: '#22c55e',
        label: 'À venir',
        path: '/appointments?status=CONFIRMED',
      },
      {
        icon: null,
        svgType: 'check',
        color: '#22c55e',
        label: 'Terminés / recommandations',
        path: '/appointments?status=COMPLETED',
      },
      {
        icon: null,
        svgType: 'x',
        color: '#ef4444',
        label: 'Annulés',
        path: '/appointments?status=CANCELLED',
        labelColor: '#ef4444',
      },
    ],
  },
  {
    title: 'Documents',
    items: [
      { icon: 'ℹ️', label: 'Ordonnances et certificats', path: '/prescriptions', color: '#22c55e' },
    ],
  },
];

function RowIcon({ type, color }) {
  if (type === 'clock') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/>
      <path strokeLinecap="round" d="M12 6v6l4 2"/>
    </svg>
  );
  if (type === 'check') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/>
      <path strokeLinecap="round" d="M8 12l3 3 5-5"/>
    </svg>
  );
  if (type === 'x') return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/>
      <path strokeLinecap="round" d="M8 8l8 8M16 8l-8 8"/>
    </svg>
  );
  return null;
}

export default function MedicalRecord() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* Titre */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Dossier Médical</h1>
      </div>

      <div className="p-4 space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">{section.title}</p>
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
                >
                  {/* Icône */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${item.color || '#22c55e'}20` }}>
                    {item.svgType ? (
                      <RowIcon type={item.svgType} color={item.color} />
                    ) : (
                      <span className="text-base">{item.icon}</span>
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className="flex-1 text-sm font-medium text-left"
                    style={{ color: item.labelColor || undefined }}
                    // Tailwind fallback for non-dynamic color
                  >
                    <span className={item.labelColor ? '' : 'text-gray-800 dark:text-gray-100'}>
                      {item.label}
                    </span>
                  </span>
                  {/* Chevron */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
