import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  format, addDays, isToday, isTomorrow, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, isSameDay, addMonths, subMonths,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, X, MapPin, Heart,
  ArrowUpDown, SlidersHorizontal, CalendarDays, Users,
} from 'lucide-react';
import api from '../../services/api';

const TIME_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30',
];

function dateLabel(date) {
  if (isToday(date))    return `Aujourd'hui · ${format(date, 'EEEE d MMMM yyyy', { locale: fr })}`;
  if (isTomorrow(date)) return `Demain · ${format(date, 'EEEE d MMMM yyyy', { locale: fr })}`;
  return format(date, 'EEEE d MMMM yyyy', { locale: fr });
}

/* ── Carte médecin ──────────────────────────────────────────────── */
function DoctorCard({ doctor, onSlotClick }) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const visibleSlots = expanded ? TIME_SLOTS.slice(0, 12) : TIME_SLOTS.slice(0, 4);

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden mb-3">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar rond */}
          {doctor.photo ? (
            <img src={doctor.photo} alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 40 40" fill="#2db87a" className="w-8 h-8 opacity-70">
                <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm-2 22h-4V14h4v12zm8 0h-4V14h4v12z"/>
              </svg>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                  Dr {doctor.prenom} {doctor.nom}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                  {doctor.experience ? `${doctor.experience} ans d'expérience` : doctor.specialite}
                </p>
              </div>
              <button
                onClick={() => setLiked(!liked)}
                className="p-1.5 rounded-full flex-shrink-0 active:scale-90 transition-transform"
              >
                <Heart
                  size={20}
                  color={liked ? '#ef4444' : '#9ca3af'}
                  fill={liked ? '#ef4444' : 'none'}
                  strokeWidth={2}
                />
              </button>
            </div>

            {doctor.description && (
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-1.5 line-clamp-2">{doctor.description}</p>
            )}
            <p className="text-sm font-bold text-primary-500 mt-2">
              {doctor.tarif?.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>
      </div>

      {/* Clinique + créneaux */}
      <div className="border-t border-gray-100 dark:border-dark-border px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <MapPin size={13} color="#2db87a" strokeWidth={2} />
          <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
            {doctor.clinique || 'Clinique TéléMéd Congo'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => onSlotClick(doctor, slot)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-dark-border rounded-pill text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary-500 hover:text-white transition-colors"
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
            <ChevronRight size={14} />
            Voir plus de créneaux
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Modal confirmation slot ───────────────────────────────────── */
function SlotModal({ doctor, slot, date, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 max-w-md mx-auto">
      <div className="bg-white dark:bg-dark-card w-full rounded-t-3xl p-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="#2db87a" className="w-6 h-6">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z"/>
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Prise de rendez-vous</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-dark-border">
            <X size={16} color="#6b7280" strokeWidth={2} />
          </button>
        </div>

        <p className="text-primary-500 font-semibold text-sm mb-4 capitalize">
          {format(date, 'EEEE d MMMM yyyy', { locale: fr })}, {slot}
        </p>

        <div className="space-y-2 mb-5">
          <div className="bg-gray-50 dark:bg-dark-surface rounded-2xl p-3">
            <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">Service</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              Consultation médicale — {doctor.specialite}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-surface rounded-2xl p-3 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 40 40" fill="#2db87a" className="w-7 h-7 opacity-70">
                <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm-2 22h-4V14h4v12zm8 0h-4V14h4v12z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 dark:text-dark-muted">{doctor.specialite}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                Dr {doctor.prenom} {doctor.nom}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-1">
            <MapPin size={14} color="#2db87a" strokeWidth={2} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {doctor.clinique || 'Clinique TéléMéd Congo'}
            </span>
          </div>
        </div>

        <button onClick={onConfirm} className="btn-primary mb-2">
          <Users size={18} />
          Saisir mes informations
        </button>
        <p className="text-center text-xs text-gray-400 dark:text-dark-muted">
          Coût préliminaire :{' '}
          <strong className="text-primary-500">{doctor.tarif?.toLocaleString('fr-FR')} FCFA</strong>
        </p>
      </div>
    </div>
  );
}

/* ── Calendrier modal ──────────────────────────────────────────── */
function CalendarModal({ selectedDate, onClose, onApply }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [picked, setPicked] = useState(selectedDate);
  const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startWeekDay = getDay(startOfMonth(currentMonth));
  const blanks = Array(startWeekDay === 0 ? 6 : startWeekDay - 1).fill(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 max-w-md mx-auto">
      <div className="bg-white dark:bg-dark-card w-full rounded-t-3xl p-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <CalendarDays size={22} color="#2db87a" strokeWidth={1.8} />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Date du rendez-vous</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-dark-border">
            <X size={16} color="#6b7280" strokeWidth={2} />
          </button>
        </div>

        {/* Navigation mois */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border">
            <ChevronLeft size={20} color="#374151" strokeWidth={2} />
          </button>
          <p className="font-bold text-gray-900 dark:text-white capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </p>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border">
            <ChevronRight size={20} color="#374151" strokeWidth={2} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAYS_FR.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-dark-muted py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => <div key={`b${i}`} />)}
          {days.map((day) => {
            const isPicked = isSameDay(day, picked);
            const isT = isToday(day);
            const isPast = day < new Date() && !isT;
            return (
              <button
                key={day.toISOString()}
                disabled={isPast}
                onClick={() => setPicked(day)}
                className={`h-9 w-full rounded-pill text-sm font-medium transition-colors ${
                  isPicked
                    ? 'bg-primary-500 text-white'
                    : isT
                    ? 'border-2 border-primary-500 text-primary-500 dark:text-primary-400'
                    : isPast
                    ? 'text-gray-300 dark:text-dark-border cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-primary-500/10'
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>

        <button onClick={() => onApply(picked)} className="btn-primary mt-5">
          Appliquer
        </button>
      </div>
    </div>
  );
}

/* ── Modal Filtres ─────────────────────────────────────────────── */
function FilterModal({ onClose, onApply }) {
  const rows = [
    { key: 'clinique', label: 'Clinique',               icon: <MapPin size={17} color="#2db87a" /> },
    { key: 'medecin',  label: 'Médecin',                icon: <Users size={17} color="#2db87a" /> },
    { key: 'date',     label: 'Date de rendez-vous',    icon: <CalendarDays size={17} color="#2db87a" /> },
    { key: 'diplome',  label: 'Diplôme & catégorie',    icon: <SlidersHorizontal size={17} color="#2db87a" /> },
    { key: 'sexe',     label: 'Sexe du médecin',        icon: <Users size={17} color="#2db87a" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-dark-bg flex flex-col max-w-md mx-auto">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-dark-border">
        <button onClick={onClose} className="p-1.5">
          <ChevronLeft size={22} color="#374151" className="dark:text-white" strokeWidth={2} />
        </button>
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">Filtres</h2>
      </div>

      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {rows.map((r) => (
          <button
            key={r.key}
            className="w-full bg-gray-50 dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
                {r.icon}
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400 dark:text-dark-muted">{r.label}</p>
                <p className="text-gray-900 dark:text-white font-semibold text-sm">Tous</p>
              </div>
            </div>
            <ChevronRight size={17} color="#2db87a" strokeWidth={2} />
          </button>
        ))}
      </div>

      <div className="px-4 pb-8 pt-2">
        <button onClick={() => onApply({})} className="btn-primary">
          Afficher les résultats
        </button>
      </div>
    </div>
  );
}

/* ── Page principale ───────────────────────────────────────────── */
export default function DoctorsBySpecialty() {
  const { specialite } = useParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterDate, setFilterDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const decodedSpecialite = decodeURIComponent(specialite);

  useEffect(() => {
    api.get(`/doctors?specialite=${encodeURIComponent(decodedSpecialite)}`)
      .then(({ data }) => setDoctors(data.doctors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [decodedSpecialite]);

  const displayDates = filterDate
    ? [filterDate]
    : [new Date(), addDays(new Date(), 1), addDays(new Date(), 2)];

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
      {/* Header */}
      <div className="header-gradient px-4 pt-3 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl bg-white/20">
            <ChevronLeft size={22} color="white" strokeWidth={2} />
          </button>
          <h1 className="text-white font-bold text-base flex-1 text-center">{decodedSpecialite}</h1>
          <div className="w-9" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCalendar(true)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-pill py-2.5 text-sm font-semibold transition-colors ${
              filterDate ? 'bg-white text-primary-500' : 'bg-white/20 text-white'
            }`}
          >
            <ArrowUpDown size={15} strokeWidth={2} />
            {filterDate ? format(filterDate, 'd MMM', { locale: fr }) : 'Date du RDV'}
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 rounded-pill py-2.5 text-white text-sm font-semibold"
          >
            <SlidersHorizontal size={15} strokeWidth={2} />
            Filtres
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="bg-white dark:bg-dark-card rounded-2xl h-40 animate-pulse" />)}
          </div>
        ) : (
          displayDates.map((date) => (
            <div key={date.toISOString()}>
              {/* Date group header */}
              <div className="bg-dark-card dark:bg-dark-surface border border-primary-500/20 rounded-2xl px-4 py-3 mb-3 text-center">
                <p className="font-bold text-white dark:text-white text-sm capitalize bg-transparent"
                   style={{ color: '#2db87a' }}>
                  {dateLabel(date)}
                </p>
              </div>
              {doctors.length === 0 ? (
                <div className="text-center py-6 text-gray-400 dark:text-dark-muted text-sm mb-4">
                  Aucun médecin disponible
                </div>
              ) : (
                doctors.map((doctor) => (
                  <DoctorCard
                    key={`${doctor.id}-${date.toISOString()}`}
                    doctor={doctor}
                    onSlotClick={(doc, slot) => { setSelectedDate(date); handleSlotClick(doc, slot); }}
                  />
                ))
              )}
            </div>
          ))
        )}
      </div>

      {selectedDoctor && selectedSlot && (
        <SlotModal
          doctor={selectedDoctor}
          slot={selectedSlot}
          date={selectedDate}
          onClose={() => { setSelectedDoctor(null); setSelectedSlot(null); }}
          onConfirm={handleConfirmSlot}
        />
      )}
      {showFilters && <FilterModal onClose={() => setShowFilters(false)} onApply={() => setShowFilters(false)} />}
      {showCalendar && (
        <CalendarModal
          selectedDate={filterDate || new Date()}
          onClose={() => setShowCalendar(false)}
          onApply={(d) => { setFilterDate(d); setShowCalendar(false); }}
        />
      )}
    </div>
  );
}
