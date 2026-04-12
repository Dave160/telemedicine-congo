import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../stores/authStore';
import { disconnectSocket } from '../hooks/useSocket';

function generateCardNumber(userId) {
  const base = userId ? userId.substring(0, 6).toUpperCase().replace(/-/g, '') : 'TC0000';
  return `TC${base}`;
}

function SettingsRow({ icon, label, value, onClick, iconBg }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${iconBg || 'bg-primary-500/10'}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</span>
      </div>
      {value && (
        <span className="text-xs text-gray-500 dark:text-dark-muted mr-2">{value}</span>
      )}
      <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-4 h-4">
        <path strokeLinecap="round" d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  );
}

function DangerRow({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-sm">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-red-500 text-left">{label}</span>
    </button>
  );
}

export default function Profile() {
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const profile = user?.patient || user?.doctor;
  const [showEditForm, setShowEditForm] = useState(false);
  const [form, setForm] = useState({
    nom: profile?.nom || '',
    prenom: profile?.prenom || '',
    email: user?.email || '',
    sexe: profile?.sexe || '',
  });
  const [saving, setSaving] = useState(false);

  const fullName = profile
    ? `${profile.prenom} ${profile.nom}`.toUpperCase()
    : user?.phone || 'Mon Compte';
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
    try {
      disconnectSocket();
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
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
      {/* En-tête profil */}
      <div className="bg-white dark:bg-dark-surface px-4 pt-6 pb-5 border-b border-gray-100 dark:border-dark-border">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          {cardNumber}
          {birthDate && ` · ${format(parseISO(birthDate), 'd.MM.yyyy')}`}
          {age && ` · ${age} ans`}
          {sexe && ` · ${sexe}`}
        </p>
        {user?.phone && (
          <p className="text-sm text-gray-500 dark:text-dark-muted">{user.phone}</p>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Formulaire d'édition (inline) */}
        {showEditForm && (
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Modifier mes informations</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <input className="input-field" placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
              <input className="input-field" placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowEditForm(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Paramètres */}
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Paramètres</p>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            <SettingsRow
              icon="📍"
              label="Ville"
              value="Brazzaville"
              onClick={() => toast('Sélection de ville disponible prochainement')}
            />
            <SettingsRow
              icon="👤"
              label="Données personnelles"
              onClick={() => setShowEditForm(!showEditForm)}
            />
            <SettingsRow
              icon="🔔"
              label="Paramètres des notifications"
              onClick={() => navigate('/notifications')}
            />
            <SettingsRow
              icon="🔑"
              label="Changer le mot de passe"
              onClick={() => toast('Changement de mot de passe disponible prochainement')}
            />
            <SettingsRow
              icon="🎨"
              label="Thème de l'application"
              value="Système"
              onClick={() => toast('Thème : suit automatiquement les préférences système')}
            />
          </div>
        </div>

        {/* Aide et support */}
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Aide et support</p>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            <SettingsRow
              icon="❓"
              label="Questions fréquentes"
              onClick={() => toast('FAQ disponible prochainement')}
            />
            <SettingsRow
              icon="ℹ️"
              label="À propos de l'application"
              onClick={() => toast('TéléMéd Congo v1.0.0 — Santé accessible à tous')}
            />
            <button
              onClick={() => toast('Merci pour votre suggestion !')}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-sm">✏️</div>
              <span className="text-sm font-medium text-primary-500">Proposer une idée</span>
            </button>
            <button
              onClick={() => toast('Rapport envoyé. Merci !', { icon: '🐛' })}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-sm">🐛</div>
              <span className="text-sm font-medium text-primary-500">Signaler une erreur</span>
            </button>
          </div>
        </div>

        {/* Autre */}
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Autre</p>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
            <DangerRow
              icon="🚪"
              label="Se déconnecter"
              onClick={handleLogout}
            />
            <DangerRow
              icon="🗑️"
              label="Supprimer le compte"
              onClick={handleDeleteAccount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
