import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInYears } from 'date-fns';
import {
  MapPin, UserRound, Bell, Lock, Sun, HelpCircle,
  Info, Pencil, AlertTriangle, LogOut, Trash2, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../stores/authStore';
import { disconnectSocket } from '../hooks/useSocket';

function generateCardNumber(userId) {
  const base = userId ? userId.substring(0, 6).toUpperCase().replace(/-/g, '') : 'TC0000';
  return `TC-${base.substring(0, 3)}-${base.substring(3, 6)}`;
}

function Row({ Icon, label, value, onClick, iconBg = 'bg-primary-500/10', iconColor = '#2db87a' }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={18} color={iconColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1 text-left">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</span>
      </div>
      {value && <span className="text-xs text-gray-400 dark:text-dark-muted mr-1">{value}</span>}
      <ChevronRight size={16} color="#2db87a" strokeWidth={2} />
    </button>
  );
}

function DangerRow({ Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
    >
      <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
        <Icon size={18} color="#ef4444" strokeWidth={1.8} />
      </div>
      <span className="flex-1 text-sm font-semibold text-red-500 text-left">{label}</span>
    </button>
  );
}

function GreenTextRow({ Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
    >
      <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
        <Icon size={18} color="#2db87a" strokeWidth={1.8} />
      </div>
      <span className="flex-1 text-sm font-semibold text-primary-500 text-left">{label}</span>
    </button>
  );
}

export default function Profile() {
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const profile = user?.patient || user?.doctor;
  const [showEditForm, setShowEditForm] = useState(false);
  const [form, setForm] = useState({
    nom: profile?.nom || '', prenom: profile?.prenom || '', email: user?.email || '', sexe: profile?.sexe || '',
  });
  const [saving, setSaving] = useState(false);

  const fullName = profile ? `${profile.prenom} ${profile.nom}` : user?.phone || 'Mon Compte';
  const cardNumber = generateCardNumber(user?.id);
  const birthDate = profile?.dateNaissance;
  const age = birthDate ? differenceInYears(new Date(), parseISO(birthDate)) : null;
  const sexe = profile?.sexe === 'M' ? 'Masculin' : profile?.sexe === 'F' ? 'Féminin' : null;

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/me', form);
      const { data } = await api.get('/users/me');
      setUser(data);
      toast.success('Profil mis à jour');
      setShowEditForm(false);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try { disconnectSocket(); await logout(); } catch {}
    navigate('/login');
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return;
    try {
      await api.delete('/users/me');
      await logout();
      navigate('/login');
    } catch {
      toast.error('Impossible de supprimer le compte');
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-full pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface px-4 pt-6 pb-5 border-b border-gray-100 dark:border-dark-border">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 flex flex-wrap gap-x-2">
          <span>{cardNumber}</span>
          {birthDate && <span>· {format(parseISO(birthDate), 'd.MM.yyyy')}</span>}
          {age && <span>· {age} ans</span>}
          {sexe && <span>· {sexe}</span>}
        </p>
        {user?.phone && <p className="text-sm text-gray-400 dark:text-dark-muted mt-0.5">{user.phone}</p>}
      </div>

      <div className="p-4 space-y-4">
        {/* Formulaire d'édition */}
        {showEditForm && (
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Modifier mes informations</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <input className="input-field" placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
              <input className="input-field" placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowEditForm(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? '…' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Paramètres */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wide mb-2">Paramètres</p>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            <Row Icon={MapPin} label="Ville" value="Brazzaville"
              onClick={() => toast('Sélection de ville disponible prochainement')} />
            <Row Icon={UserRound} label="Données personnelles"
              onClick={() => setShowEditForm(!showEditForm)} />
            <Row Icon={Bell} label="Notifications"
              onClick={() => navigate('/notifications')} />
            <Row Icon={Lock} label="Changer le mot de passe"
              onClick={() => toast('Changement de mot de passe disponible prochainement')} />
            <Row Icon={Sun} label="Thème de l'application" value="Système"
              onClick={() => toast('Le thème suit automatiquement les préférences système')} />
          </div>
        </div>

        {/* Aide et support */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wide mb-2">Aide et support</p>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            <Row Icon={HelpCircle} label="Questions fréquentes"
              onClick={() => toast('FAQ disponible prochainement')} />
            <Row Icon={Info} label="À propos de l'application"
              onClick={() => toast('TéléMéd Congo v1.0.0 — Santé accessible à tous')} />
            <GreenTextRow Icon={Pencil} label="Proposer une idée"
              onClick={() => toast('Merci pour votre suggestion !')} />
            <GreenTextRow Icon={AlertTriangle} label="Signaler une erreur"
              onClick={() => toast('Rapport envoyé. Merci !', { icon: '🐛' })} />
          </div>
        </div>

        {/* Danger */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wide mb-2">Compte</p>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            <DangerRow Icon={LogOut} label="Se déconnecter" onClick={handleLogout} />
            <DangerRow Icon={Trash2} label="Supprimer le compte" onClick={handleDeleteAccount} />
          </div>
        </div>
      </div>
    </div>
  );
}
