import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.phone, form.password);
      toast.success('Connexion réussie !');
      if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <div className="bg-primary-500 text-white px-6 py-12 text-center">
        <div className="text-5xl mb-3">🏥</div>
        <h1 className="text-2xl font-bold">TéléMéd Congo</h1>
        <p className="text-primary-100 text-sm mt-1">Santé accessible à tous</p>
      </div>

      <div className="flex-1 px-6 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Connexion</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Comptes de test en dev */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-700 mb-2">🧪 Comptes de test</p>
            {[
              { label: 'Patient', phone: '+242070000001', pass: 'Patient1234!' },
              { label: 'Médecin', phone: '+242061111111', pass: 'Doctor1234!' },
              { label: 'Admin', phone: '+242060000000', pass: 'Admin1234!' },
            ].map((c) => (
              <button
                key={c.label}
                onClick={() => setForm({ phone: c.phone, password: c.pass })}
                className="block text-xs text-yellow-600 font-medium mb-1"
              >
                {c.label}: {c.phone}
              </button>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore inscrit ?{' '}
          <Link to="/register" className="text-primary-600 font-semibold">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
