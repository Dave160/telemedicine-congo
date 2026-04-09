import { Link } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  return (
    <Link to={`/doctors/${doctor.id}`} className="card flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {doctor.photo ? (
          <img src={doctor.photo} alt={doctor.nom} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">👨‍⚕️</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 truncate">
            Dr {doctor.prenom} {doctor.nom}
          </p>
          {doctor.isAvailableNow && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-400"></span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{doctor.specialite}</p>
        <p className="text-sm font-semibold text-primary-600 mt-0.5">{doctor.tarif?.toLocaleString()} FCFA</p>
      </div>
      <div className="text-gray-300 text-lg flex-shrink-0">›</div>
    </Link>
  );
}
