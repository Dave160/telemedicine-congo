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
    <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col max-w-md mx-auto">
      {/* Header vert */}
      <div className="bg-primary-500 px-6 pt-16 pb-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
          <svg viewBox="0 0 40 40" fill="white" className="w-10 h-10">
            <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm-2 22h-4V14h4v12zm8 0h-4V14h4v12z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">TéléMéd Congo</h1>
        <p className="text-white/80 text-sm mt-1">Santé accessible à tous</p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 px-6 py-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Connexion</h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">Entrez votre numéro de téléphone</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Numéro de téléphone
            </label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Mot de passe
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Connexion en cours...' : 'Se connecter →'}
          </button>
        </form>

        {/* Comptes de test */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">🧪 Comptes de test</p>
            {[
              { label: 'Patient', phone: '+242070000001', pass: 'Patient1234!' },
              { label: 'Médecin', phone: '+242061111111', pass: 'Doctor1234!' },
              { label: 'Admin', phone: '+242060000000', pass: 'Admin1234!' },
            ].map((c) => (
              <button
                key={c.label}
                onClick={() => setForm({ phone: c.phone, password: c.pass })}
                className="block text-xs text-amber-600 dark:text-amber-400 font-medium mb-1 hover:underline"
              >
                {c.label} : {c.phone}
              </button>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-dark-muted mt-8">
          Pas encore inscrit ?{' '}
          <Link to="/register" className="text-primary-500 font-semibold">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
