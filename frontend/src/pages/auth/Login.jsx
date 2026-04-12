import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Splash haut — gradient vert */}
      <div className="header-gradient px-6 pt-16 pb-14 flex flex-col items-center relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute top-16 -left-12 w-32 h-32 rounded-full bg-white/10" />

        <div className="w-20 h-20 rounded-3xl bg-white/25 flex items-center justify-center mb-5 shadow-lg relative z-10">
          <svg viewBox="0 0 40 40" fill="white" className="w-11 h-11">
            <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm-2 22h-4V14h4v12zm8 0h-4V14h4v12z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white relative z-10">TéléMéd Congo</h1>
        <p className="text-white/80 text-sm mt-1 relative z-10">Votre santé, notre priorité</p>
      </div>

      {/* Carte formulaire */}
      <div className="flex-1 bg-white dark:bg-dark-bg -mt-5 rounded-t-3xl px-6 pt-8 pb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Connexion</h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mb-7">Entrez vos identifiants pour continuer</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Numéro de téléphone
            </label>
            <div className="relative">
              <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
              <input
                className="input-field pl-10"
                type="tel"
                placeholder="+242 06 XXX XXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
              <input
                className="input-field pl-10"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Connexion…' : 'Se connecter'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Comptes de test */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">Comptes de test</p>
            {[
              { label: 'Patient', phone: '+242070000001', pass: 'Patient1234!' },
              { label: 'Médecin', phone: '+242061111111', pass: 'Doctor1234!' },
              { label: 'Admin',   phone: '+242060000000', pass: 'Admin1234!' },
            ].map((c) => (
              <button
                key={c.label}
                onClick={() => setForm({ phone: c.phone, password: c.pass })}
                className="block text-xs text-amber-600 dark:text-amber-400 font-medium mb-1 hover:underline"
              >
                {c.label} — {c.phone}
              </button>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-dark-muted mt-8">
          Pas encore inscrit ?{' '}
          <Link to="/register" className="text-primary-500 font-semibold">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
