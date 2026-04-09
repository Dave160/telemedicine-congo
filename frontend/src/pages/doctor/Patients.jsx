import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function DoctorPatients() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/appointments?status=COMPLETED')
      .then(({ data }) => setAppointments(data.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Deduplicate patients from completed appointments
  const patientMap = new Map();
  appointments.forEach((a) => {
    if (a.patient) {
      const key = a.patient.id || a.patient.userId;
      if (!patientMap.has(key)) {
        patientMap.set(key, { ...a.patient, lastAppointment: a, consultCount: 1 });
      } else {
        patientMap.get(key).consultCount += 1;
        const existing = patientMap.get(key);
        if (!existing.lastAppointment?.scheduledAt || (a.scheduledAt && new Date(a.scheduledAt) > new Date(existing.lastAppointment.scheduledAt))) {
          patientMap.get(key).lastAppointment = a;
        }
      }
    }
  });
  const patients = Array.from(patientMap.values()).filter((p) => {
    const name = `${p.prenom || ''} ${p.nom || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Mes patients</h2>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          className="input pl-9"
          placeholder="Rechercher un patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card h-16 bg-gray-100 animate-pulse" />)}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">👥</p>
          <p className="text-gray-500 font-medium">Aucun patient</p>
          <p className="text-sm text-gray-400 mt-1">Vos patients apparaîtront après vos consultations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map((patient) => (
            <div key={patient.id || patient.userId} className="card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {patient.sexe === 'F' ? '👩' : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {patient.prenom} {patient.nom}
                  </p>
                  <p className="text-xs text-gray-400">
                    {patient.consultCount} consultation{patient.consultCount > 1 ? 's' : ''}
                    {patient.lastAppointment?.scheduledAt
                      ? ` · Dernière : ${new Date(patient.lastAppointment.scheduledAt).toLocaleDateString('fr-FR')}`
                      : ''}
                  </p>
                </div>
                {patient.lastAppointment?.conversation?.id && (
                  <Link
                    to={`/chat/${patient.lastAppointment.conversation.id}`}
                    className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-lg"
                    title="Ouvrir le chat"
                  >
                    💬
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
