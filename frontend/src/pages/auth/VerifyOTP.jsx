import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, devOtp } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const { init } = useAuthStore();

  useEffect(() => {
    if (!phone) navigate('/register');
    if (devOtp) toast('Code OTP de test : ' + devOtp, { icon: '🔑', duration: 10000 });
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Entrez les 6 chiffres du code');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp: code });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      await init();
      toast.success('Compte vérifié !');
      if (data.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code incorrect');
    } finally {
      setLoading(false);
    }
  }

  async function resendOTP() {
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-otp', { phone });
      toast.success('Nouveau code envoyé');
      if (data.devOtp) toast('Code de test : ' + data.devOtp, { icon: '🔑', duration: 10000 });
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Splash vert */}
      <div className="header-gradient px-6 pt-14 pb-14 flex flex-col items-center relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="w-20 h-20 rounded-3xl bg-white/25 flex items-center justify-center mb-4 shadow-lg relative z-10">
          <ShieldCheck size={40} color="white" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-bold text-white relative z-10">Vérification</h1>
        <p className="text-white/80 text-sm mt-1 relative z-10 text-center">
          Code envoyé au<br/><span className="font-bold">{phone}</span>
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 bg-white dark:bg-dark-bg -mt-5 rounded-t-3xl px-6 pt-8 pb-10">
        <p className="text-sm text-gray-500 dark:text-dark-muted mb-7 text-center">
          Entrez le code à 6 chiffres reçu par SMS
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 justify-center mb-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-2xl focus:outline-none transition-colors ${
                  digit
                    ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card focus:border-primary-400 text-gray-900 dark:text-white'
                }`}
              />
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Vérification…' : 'Confirmer'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-dark-muted">Vous n'avez pas reçu le code ?</p>
          <button
            onClick={resendOTP}
            disabled={resending}
            className="text-primary-500 font-semibold text-sm mt-1.5"
          >
            {resending ? 'Envoi…' : 'Renvoyer le code'}
          </button>
        </div>
      </div>
    </div>
  );
}
