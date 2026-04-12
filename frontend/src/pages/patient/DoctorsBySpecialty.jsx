import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';

const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
                    '12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30'];

function dateLabel(date) {
  if (isToday(date)) return `Aujourd'hui : ${format(date, 'EEEE d MMMM yyyy', { locale: fr })}`;
  if (isTomorrow(date)) return `Demain : ${format(date, 'EEEE d MMMM yyyy', { locale: fr })}`;
  return format(date, 'EEEE d MMMM yyyy', { locale: fr });
}

function DoctorCard({ doctor, onSlotClick }) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const slots = TIME_SLOTS.slice(0, expanded ? 8 : 4);

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden mb-3">
      {/* Infos médecin */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {doctor.photo ? (
            <img src={doctor.photo} alt="Dr" className="w-14 h-14 rounded-xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center text-2xl">
              👨‍⚕️
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  Dr {doctor.prenom} {doctor.nom}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                  {doctor.experience ? `${doctor.experience} ans d'expérience` : doctor.specialite}
                </p>
              </div>
              <button onClick={() => setLiked(!liked)} className="p-1">
                <svg viewBox="0 0 24 24" fill={liked ? '#22c55e' : 'none'} stroke={liked ? '#22c55e' : '#9ca3af'} strokeWidth="2" className="w-5 h-5">
                  <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
                </svg>
              </button>
            </div>
            {doctor.description && (
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-2 line-clamp-2">
                {doctor.description}
              </p>
            )}
            <p className="text-sm font-bold text-primary-500 mt-2">
              {doctor.tarif?.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>
      </div>

      {/* Clinique + créneaux */}
      <div className="border-t border-gray-100 dark:border-dark-border px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="#22c55e" className="w-4 h-4">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {doctor.clinique || 'Clinique TéléMéd Congo'}
            </span>
          </div>
          <button onClick={() => setLiked(!liked)} className="p-1 opacity-0">—</button>
        </div>

        {/* Créneaux horaires */}
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => onSlotClick(doctor, slot)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-dark-border rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary-500 hover:text-white transition-colors"
            >
              {slot}
            </button>
          ))}
        </div>

        {!expanded && TIME_SLOTS.length > 4 && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-center gap-1 mt-2 text-xs text-primary-500 font-medium py-1"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path strokeLinecap="round" d="M19 9l-7 7-7-7"/>
            </svg>
            Voir plus de créneaux
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Modal confirmation slot ── */
function SlotModal({ doctor, slot, date, onClose, onConfirm }) {
  if (!doctor) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-t-3xl p-6">
        {/* Logo + fermer */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <svg viewBox="0 0 40 40" fill="#22c55e" className="w-6 h-6">
              <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm-2 22h-4V14h4v12zm8 0h-4V14h4v12z"/>
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Prise de rendez-vous</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-dark-border">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <p className="text-primary-500 font-semibold text-sm mb-4">
          {format(date, 'EEEE d MMMM yyyy', { locale: fr })}, {slot}
        </p>

        {/* Service */}
        <div className="bg-gray-50 dark:bg-dark-surface rounded-2xl p-3 mb-3">
          <p className="text-xs text-gray-500 dark:text-dark-muted mb-0.5">Service</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white">
            Consultation médicale — {doctor.specialite}
          </p>
        </div>

        {/* Médecin */}
        <div className="bg-gray-50 dark:bg-dark-surface rounded-2xl p-3 mb-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-xl">👨‍⚕️</div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-dark-muted">{doctor.specialite}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Dr {doctor.prenom} {doctor.nom}</p>
          </div>
          <button className="p-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="w-4 h-4">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
          </button>
        </div>

        {/* Clinique */}
        <div className="flex items-center gap-2 mb-5">
          <svg viewBox="0 0 24 24" fill="#22c55e" className="w-4 h-4">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {doctor.clinique || 'Clinique TéléMéd Congo'}
          </span>
        </div>

        <button
          onClick={onConfirm}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          Saisir mes informations
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-dark-muted mt-2">
          Coût préliminaire : <strong className="text-primary-500">{doctor.tarif?.toLocaleString('fr-FR')} FCFA</strong>
        </p>
      </div>
    </div>
  );
}

/* ── Modal Filtres ── */
function FilterModal({ onClose, onApply }) {
  const [filters, setFilters] = useState({
    clinique: 'Tous',
    medecin: 'Tous',
    date: 'Tous',
    diplome: 'Tous',
    sexe: 'Tous',
  });

  const rows = [
    { key: 'clinique', label: 'Clinique' },
    { key: 'medecin', label: 'Médecin' },
    { key: 'date', label: 'Date de rendez-vous', icon: true },
    { key: 'diplome', label: 'Diplôme & catégorie spéciale' },
    { key: 'sexe', label: 'Sexe du médecin' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-dark-bg">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-dark-border">
        <button onClick={onClose} className="text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 className="text-white font-bold text-lg">Filtre</h2>
      </div>
      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {rows.map((r) => (
          <div key={r.key} className="bg-dark-card rounded-2xl border border-dark-border px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-dark-muted">{r.label}</p>
              <p className="text-white font-bold text-sm">{filters[r.key]}</p>
            </div>
            {r.icon ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-5 h-5">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" d="M9 18l6-6-6-6"/>
              </svg>
            )}
          </div>
        ))}
      </div>
      <div className="px-4 pb-6">
        <button onClick={() => onApply(filters)} className="btn-primary">
          Afficher les résultats
        </button>
      </div>
    </div>
  );
}

export default function DoctorsBySpecialty() {
  const { specialite } = useParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const decodedSpecialite = decodeURIComponent(specialite);

  useEffect(() => {
    api.get(`/doctors?specialite=${encodeURIComponent(decodedSpecialite)}`)
      .then(({ data }) => setDoctors(data.doctors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [decodedSpecialite]);

  // Grouper médecins par date (aujourd'hui / demain / etc.)
  const dates = [new Date(), addDays(new Date(), 1), addDays(new Date(), 2)];

  function handleSlotClick(doctor, slot) {
    setSelectedDoctor(doctor);
    setSelectedSlot(slot);
  }

  function handleConfirmSlot() {
    if (!selectedDoctor) return;
    navigate(`/book/${selectedDoctor.id}?slot=${selectedSlot}&date=${selectedDate.toISOString()}`);
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full">
      {/* Header spécialité */}
      <div className="bg-primary-500 px-4 pt-3 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
              <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-white font-bold text-base flex-1 text-center">{decodedSpecialite}</h1>
          <div className="w-6" />
        </div>
        {/* Boutons date + filtres */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 bg-white/20 rounded-xl py-2.5 text-white text-sm font-medium">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Date du rendez-vous
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 rounded-xl py-2.5 text-white text-sm font-medium"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
              <path strokeLinecap="round" d="M4 6h16M7 12h10M10 18h4"/>
            </svg>
            Filtres
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-dark-card rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          dates.map((date) => (
            <div key={date.toISOString()}>
              {/* Label de date */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl px-4 py-3 mb-3 text-center">
                <p className="font-bold text-gray-900 dark:text-white text-sm capitalize">
                  {dateLabel(date)}
                </p>
              </div>

              {/* Médecins du jour */}
              {doctors.length === 0 ? (
                <div className="text-center py-6 text-gray-400 dark:text-dark-muted text-sm mb-4">
                  Aucun médecin disponible ce jour
                </div>
              ) : (
                doctors.map((doctor) => (
                  <DoctorCard
                    key={`${doctor.id}-${date.toISOString()}`}
                    doctor={doctor}
                    onSlotClick={(doc, slot) => {
                      setSelectedDate(date);
                      handleSlotClick(doc, slot);
                    }}
                  />
                ))
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal slot */}
      {selectedDoctor && selectedSlot && (
        <SlotModal
          doctor={selectedDoctor}
          slot={selectedSlot}
          date={selectedDate}
          onClose={() => { setSelectedDoctor(null); setSelectedSlot(null); }}
          onConfirm={handleConfirmSlot}
        />
      )}

      {/* Modal filtres */}
      {showFilters && (
        <FilterModal
          onClose={() => setShowFilters(false)}
          onApply={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
