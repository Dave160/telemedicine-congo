import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Heart, UserCog, Clock } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const SPECIALITES = [
  'Médecin généraliste', 'Pédiatre', 'Cardiologue', 'Gynécologue-obstétricien',
  'Dermatologue', 'Ophtalmologue', 'ORL', 'Pneumologue', 'Neurologue',
  'Psychiatre', 'Chirurgien', 'Rhumatologue', 'Endocrinologue', 'Gastro-entérologue',
  'Néphrologue', 'Hématologue', 'Infectiologue', 'Urgentiste',
  'Dentiste', 'Radiologue', 'Kinésithérapeute', 'Nutritionniste',
];

function groupByLetter(list) {
  const map = {};
  list.forEach((s) => {
    const letter = s[0].toUpperCase();
    if (!map[letter]) map[letter] = [];
    map[letter].push(s);
  });
  return map;
}

export default function Doctors() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [favorites, setFavorites] = useState([]);
  const [recentSpecialties, setRecentSpecialties] = useState([]);
  const [search, setSearch] = useState('');
  const sectionRefs = useRef({});

  const patient = user?.patient;
  const patientName = patient ? `${patient.prenom} ${patient.nom}` : 'Patient';

  useEffect(() => {
    try { setRecentSpecialties(JSON.parse(localStorage.getItem('recentSpecialties') || '[]')); } catch {}
    try { setFavorites(JSON.parse(localStorage.getItem('favoriteSpecialties') || '[]')); } catch {}
  }, []);

  const filtered = search.trim()
    ? SPECIALITES.filter((s) => s.toLowerCase().includes(search.toLowerCase()))
    : SPECIALITES;

  const grouped = groupByLetter(filtered);
  const letters = Object.keys(grouped).sort();

  function scrollToLetter(letter) {
    sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleSpecialtyClick(specialite) {
    const recent = JSON.parse(localStorage.getItem('recentSpecialties') || '[]');
    const updated = [specialite, ...recent.filter((s) => s !== specialite)].slice(0, 3);
    localStorage.setItem('recentSpecialties', JSON.stringify(updated));
    navigate(`/doctors/specialty/${encodeURIComponent(specialite)}`);
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* Header */}
      <div className="header-gradient px-4 pt-3 pb-4">
        <div className="bg-white/20 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs">Patient</p>
            <p className="text-white font-bold text-sm">{patientName}</p>
          </div>
          <button className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5">
            <UserCog size={15} color="white" strokeWidth={2} />
            <span className="text-white text-xs font-medium">Changer</span>
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2.5 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl px-3.5 py-3">
          <Search size={17} color="#9ca3af" strokeWidth={2} />
          <input
            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-dark-muted outline-none"
            placeholder="Rechercher une spécialité…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 pb-4 space-y-1">
        {/* Alphabet rapide */}
        {!search && (
          <div className="flex flex-wrap gap-1 py-2">
            {ALPHABET.map((l) => {
              const available = !!grouped[l];
              return (
                <button
                  key={l}
                  onClick={() => available && scrollToLetter(l)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    available
                      ? 'text-primary-500 dark:text-primary-400 hover:bg-primary-500/10'
                      : 'text-gray-300 dark:text-dark-border cursor-default'
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        )}

        {/* Favoris */}
        {!search && favorites.length > 0 && (
          <div className="mb-1">
            <button
              onClick={() => navigate('/doctors/specialty/Favoris')}
              className="w-full flex items-center justify-between bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border px-4 py-3.5 mb-1.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Heart size={18} color="#ef4444" fill="#ef4444" strokeWidth={2} />
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">Favoris</span>
              </div>
              <ChevronRight size={17} color="#2db87a" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Dernières consultations */}
        {!search && recentSpecialties.length > 0 && (
          <div className="mb-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wide px-1 py-2">
              Récentes
            </p>
            {recentSpecialties.map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecialtyClick(spec)}
                className="w-full flex items-center justify-between bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border px-4 py-3.5 mb-1.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Clock size={17} color="#2db87a" strokeWidth={1.8} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{spec}</span>
                </div>
                <ChevronRight size={17} color="#2db87a" strokeWidth={2} />
              </button>
            ))}
          </div>
        )}

        {/* Toutes les spécialités par lettre */}
        {!search && (
          <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wide px-1 py-2">
            Toutes les spécialités
          </p>
        )}
        {letters.map((letter) => (
          <div key={letter} ref={(el) => (sectionRefs.current[letter] = el)}>
            <div className="flex items-center gap-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{letter}</span>
              </div>
              <div className="flex-1 h-px bg-gray-200 dark:bg-dark-border" />
            </div>
            {grouped[letter].map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecialtyClick(spec)}
                className="w-full flex items-center justify-between bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border px-4 py-3.5 mb-1.5 active:scale-98 transition-transform"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{spec}</span>
                <ChevronRight size={17} color="#2db87a" strokeWidth={2} />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
