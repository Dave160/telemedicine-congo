import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, Lock, UserRound, Stethoscope, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', email: '', password: '', confirm: '', role: 'PATIENT' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Les mots de passe ne correspondent pas');
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
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Splash vert */}
      <div className="header-gradient px-6 pt-14 pb-14 flex flex-col items-center relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute top-14 -left-10 w-28 h-28 rounded-full bg-white/10" />
        <div className="w-18 h-18 rounded-3xl bg-white/25 flex items-center justify-center mb-4 shadow-lg relative z-10 p-4">
          <svg viewBox="0 0 40 40" fill="white" className="w-10 h-10">
            <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm-2 22h-4V14h4v12zm8 0h-4V14h4v12z"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white relative z-10">Créer un compte</h1>
        <p className="text-white/80 text-sm mt-1 relative z-10">TéléMéd Congo</p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 bg-white dark:bg-dark-bg -mt-5 rounded-t-3xl px-6 pt-8 pb-10">
        {/* Sélecteur rôle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: 'PATIENT', label: 'Patient', Icon: UserRound },
            { value: 'DOCTOR',  label: 'Médecin', Icon: Stethoscope },
          ].map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, role: value })}
              className={`py-3 rounded-2xl border-2 font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                form.role === value
                  ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-muted'
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Téléphone *</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input-field pl-10" type="tel" placeholder="+242 06 XXX XXXX"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email (optionnel)</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input-field pl-10" type="email" placeholder="vous@exemple.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input-field pl-10" type="password" placeholder="Minimum 6 caractères"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmer le mot de passe *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input-field pl-10" type="password" placeholder="Répéter le mot de passe"
                value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Inscription…" : "Créer mon compte"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-dark-muted mt-8">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-primary-500 font-semibold">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
