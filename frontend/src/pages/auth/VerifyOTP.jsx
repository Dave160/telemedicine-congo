import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <div className="w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📱</div>
          <h1 className="text-2xl font-bold text-gray-900">Vérification</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Entrez le code à 6 chiffres envoyé au<br />
            <span className="font-semibold text-gray-700">{phone}</span>
          </p>
        </div>

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
                className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-colors ${
                  digit ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 focus:border-primary-400'
                }`}
              />
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Vérification...' : 'Confirmer'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Vous n'avez pas reçu le code ?</p>
          <button
            onClick={resendOTP}
            disabled={resending}
            className="text-primary-600 font-semibold text-sm mt-1"
          >
            {resending ? 'Envoi...' : 'Renvoyer le code'}
          </button>
        </div>
      </div>
    </div>
  );
}
