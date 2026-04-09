import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import DoctorCard from '../../components/common/DoctorCard';

const SPECIALITES = ['Tous', 'Médecin généraliste', 'Pédiatre', 'Cardiologue', 'Gynécologue', 'Dermatologue'];

export default function Doctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialite, setSpecialite] = useState('Tous');
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('available') === 'true');

  useEffect(() => {
    fetchDoctors();
  }, [specialite, availableOnly]);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (specialite !== 'Tous') params.set('specialite', specialite);
      if (availableOnly) params.set('available', 'true');
      if (search) params.set('search', search);

      const { data } = await api.get(`/doctors?${params}`);
      setDoctors(data.doctors);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchDoctors();
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Nos médecins</h2>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="Rechercher un médecin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-primary-500 text-white px-4 rounded-xl font-medium text-sm">
          🔍
        </button>
      </form>

      {/* Disponible maintenant toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setAvailableOnly(!availableOnly)}
          className={`w-12 h-6 rounded-full relative transition-colors ${availableOnly ? 'bg-green-400' : 'bg-gray-200'}`}
        >
          <span
            className={`absolute w-5 h-5 rounded-full bg-white shadow top-0.5 transition-transform ${
              availableOnly ? 'left-6' : 'left-0.5'
            }`}
          />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {availableOnly ? '⚡ Disponibles maintenant' : 'Tous les médecins'}
        </span>
      </label>

      {/* Spécialités filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SPECIALITES.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialite(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              specialite === s
                ? 'bg-primary-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card h-20 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-gray-500">Aucun médecin trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
        </div>
      )}
    </div>
  );
}
