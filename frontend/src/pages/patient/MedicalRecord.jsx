import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, Microscope, Clock, CheckCircle, XCircle,
  FileText, ChevronRight,
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'Données du dossier médical',
    items: [
      { Icon: FlaskConical,  label: 'Analyses',    path: '/analyses',              color: '#2db87a', bg: 'bg-primary-500/10' },
      { Icon: Microscope,    label: 'Examens',     path: '/analyses?type=examens', color: '#2db87a', bg: 'bg-primary-500/10' },
    ],
  },
  {
    title: 'Rendez-vous',
    items: [
      { Icon: Clock,         label: 'À venir',                    path: '/appointments?status=CONFIRMED',  color: '#2db87a', bg: 'bg-primary-500/10' },
      { Icon: CheckCircle,   label: 'Terminés / recommandations', path: '/appointments?status=COMPLETED',  color: '#2db87a', bg: 'bg-primary-500/10' },
      { Icon: XCircle,       label: 'Annulés',                    path: '/appointments?status=CANCELLED',  color: '#ef4444', bg: 'bg-red-500/10', labelColor: '#ef4444' },
    ],
  },
  {
    title: 'Documents',
    items: [
      { Icon: FileText,      label: 'Ordonnances et certificats', path: '/prescriptions',                  color: '#2db87a', bg: 'bg-primary-500/10' },
    ],
  },
];

export default function MedicalRecord() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* Header */}
      <div className="header-gradient px-4 pt-4 pb-5">
        <h1 className="text-xl font-bold text-white">Dossier Médical</h1>
        <p className="text-white/70 text-sm mt-0.5">Vos données de santé</p>
      </div>

      <div className="p-4 space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wide mb-2">
              {section.title}
            </p>
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.bg}`}>
                    <item.Icon size={18} color={item.color} strokeWidth={1.8} />
                  </div>
                  <span
                    className="flex-1 text-sm font-medium text-left"
                    style={{ color: item.labelColor || undefined }}
                  >
                    {!item.labelColor && <span className="text-gray-800 dark:text-gray-100">{item.label}</span>}
                    {item.labelColor && item.label}
                  </span>
                  <ChevronRight size={16} color={item.color} strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
