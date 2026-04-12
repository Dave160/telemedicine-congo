import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const SPECIALITES = [
  'Médecin généraliste', 'Pédiatre', 'Cardiologue', 'Gynécologue-obstétricien',
  'Dermatologue', 'Ophtalmologue', 'ORL', 'Pneumologue', 'Neurologue',
  'Psychiatre', 'Chirurgien', 'Rhumatologue', 'Endocrinologue', 'Gastro-entérologue',
  'Néphrologue', 'Hématologue', 'Infectiologue', 'Urgentiste',
  'Dentiste', 'Radiologue', 'Kinésithérapeute', 'Nutritionniste',
];

function groupByLetter(specialites) {
  const map = {};
  specialites.forEach((s) => {
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
    // Dernières spécialités consultées (depuis localStorage)
    try {
      const recent = JSON.parse(localStorage.getItem('recentSpecialties') || '[]');
      setRecentSpecialties(recent);
    } catch {}
    // Favoris (médecins aimés)
    try {
      const favs = JSON.parse(localStorage.getItem('favoriteSpecialties') || '[]');
      setFavorites(favs);
    } catch {}
  }, []);

  const filtered = search.trim()
    ? SPECIALITES.filter((s) => s.toLowerCase().includes(search.toLowerCase()))
    : SPECIALITES;

  const grouped = groupByLetter(filtered);
  const letters = Object.keys(grouped).sort();

  function scrollToLetter(letter) {
    const el = sectionRefs.current[letter];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleSpecialtyClick(specialite) {
    // Sauvegarder dans les récentes
    const recent = JSON.parse(localStorage.getItem('recentSpecialties') || '[]');
    const updated = [specialite, ...recent.filter((s) => s !== specialite)].slice(0, 3);
    localStorage.setItem('recentSpecialties', JSON.stringify(updated));
    navigate(`/doctors/specialty/${encodeURIComponent(specialite)}`);
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full flex">
      {/* Contenu principal */}
      <div className="flex-1 pb-4">
        {/* Header avec carte patient */}
        <div className="bg-primary-500 px-4 pt-3 pb-4">
          <div className="bg-white/15 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs">Patient</p>
              <p className="text-white font-bold text-sm">{patientName}</p>
            </div>
            <button className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <span className="text-white text-xs font-medium">Changer</span>
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl px-3 py-2.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="w-4 h-4">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-dark-muted outline-none"
              placeholder="Rechercher une spécialité..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-4 space-y-1 overflow-y-auto">
          {/* Alphabet rapide — horizontal */}
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
                className="w-full flex items-center justify-between bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border px-4 py-3.5"
                onClick={() => navigate('/doctors/specialty/Favoris')}
              >
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" fill="#22c55e" className="w-5 h-5">
                    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
                  </svg>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">Favoris</span>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          )}

          {/* Dernières consultations */}
          {!search && recentSpecialties.length > 0 && (
            <div className="mb-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted px-1 py-2">
                Dernières consultations
              </p>
              {recentSpecialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => handleSpecialtyClick(spec)}
                  className="w-full flex items-center justify-between bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border px-4 py-3.5 mb-1"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{spec}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* Toutes les spécialités par lettre */}
          <div>
            {!search && (
              <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted px-1 py-2">
                Toutes les spécialités
              </p>
            )}
            {letters.map((letter) => (
              <div key={letter} ref={(el) => (sectionRefs.current[letter] = el)}>
                {/* Ancre alphabétique */}
                <div className="flex items-center gap-3 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{letter}</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-dark-border" />
                </div>
                {grouped[letter].map((spec) => (
                  <button
                    key={spec}
                    onClick={() => handleSpecialtyClick(spec)}
                    className="w-full flex items-center justify-between bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border px-4 py-3.5 mb-1.5"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{spec}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-4 h-4">
                      <path strokeLinecap="round" d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
