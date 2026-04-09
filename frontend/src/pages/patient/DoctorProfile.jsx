import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then(({ data }) => setDoctor(data))
      .catch(() => toast.error('Médecin introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card h-20 bg-gray-100 animate-pulse rounded-2xl" />)}</div>;
  if (!doctor) return null;

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary-500 text-white px-4 pt-6 pb-10 relative">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-4 text-white text-xl">←</button>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white mx-auto flex items-center justify-center text-4xl mb-3 overflow-hidden">
            {doctor.photo ? <img src={doctor.photo} alt={doctor.nom} className="w-full h-full object-cover" /> : '👨‍⚕️'}
          </div>
          <h1 className="text-xl font-bold">Dr {doctor.prenom} {doctor.nom}</h1>
          <p className="text-primary-100 text-sm">{doctor.specialite}</p>
          {doctor.isAvailableNow && (
            <span className="inline-flex items-center gap-1 bg-green-400 text-white text-xs font-medium px-2 py-0.5 rounded-full mt-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              Disponible maintenant
            </span>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        {/* Tarif & action */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tarif consultation</p>
            <p className="text-2xl font-bold text-primary-600">{doctor.tarif?.toLocaleString()} FCFA</p>
          </div>
          <Link
            to={`/book/${doctor.id}`}
            className="bg-primary-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
          >
            Réserver
          </Link>
        </div>

        {/* Description */}
        {doctor.description && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-2">À propos</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{doctor.description}</p>
          </div>
        )}

        {/* Disponibilités */}
        {doctor.availabilities?.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-3">Disponibilités</h3>
            <div className="space-y-2">
              {doctor.availabilities.map((av) => (
                <div key={av.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {av.dayOfWeek !== null ? DAYS[av.dayOfWeek] : av.specificDate ? new Date(av.specificDate).toLocaleDateString('fr-FR') : '-'}
                  </span>
                  <span className="text-gray-500">{av.startTime} – {av.endTime}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link to={`/book/${doctor.id}`} className="btn-primary">
          Prendre rendez-vous
        </Link>
      </div>
    </div>
  );
}
