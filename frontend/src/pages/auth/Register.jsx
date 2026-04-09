import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', email: '', password: '', confirm: '', role: 'PATIENT' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return toast.error('Les mots de passe ne correspondent pas');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        role: form.role,
      });
      toast.success('Code OTP envoyé sur votre téléphone !');
      navigate('/verify-otp', { state: { phone: form.phone, devOtp: data.devOtp } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary-500 text-white px-6 py-10 text-center">
        <div className="text-5xl mb-3">🏥</div>
        <h1 className="text-2xl font-bold">TéléMéd Congo</h1>
        <p className="text-primary-100 text-sm mt-1">Créer votre compte</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'PATIENT' })}
              className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                form.role === 'PATIENT'
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              👤 Patient
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'DOCTOR' })}
              className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                form.role === 'DOCTOR'
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              🩺 Médecin
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <input
              className="input-field"
              type="tel"
              placeholder="+242 06 XXX XXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (optionnel)</label>
            <input
              className="input-field"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <input
              className="input-field"
              type="password"
              placeholder="Minimum 6 caractères"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
            <input
              className="input-field"
              type="password"
              placeholder="Répéter le mot de passe"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-primary-600 font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
