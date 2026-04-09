import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CATEGORIES = ['nutrition', 'grossesse', 'maladies', 'hygiene', 'pediatrie', 'general'];

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', isPublished: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/articles/admin/all').then(({ data }) => setArticles(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await api.put(`/admin/articles/${editingId}`, form);
        setArticles(articles.map((a) => (a.id === editingId ? data : a)));
        toast.success('Article mis à jour');
      } else {
        const { data } = await api.post('/admin/articles', form);
        setArticles([data, ...articles]);
        toast.success('Article créé');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', content: '', category: 'general', isPublished: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  function editArticle(article) {
    setForm({ title: article.title, content: article.content, category: article.category, isPublished: article.isPublished });
    setEditingId(article.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  }

  async function deleteArticle(id) {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await api.delete(`/admin/articles/${id}`);
      setArticles(articles.filter((a) => a.id !== id));
      toast.success('Article supprimé');
    } catch {
      toast.error('Erreur');
    }
  }

  async function togglePublish(article) {
    try {
      const { data } = await api.put(`/admin/articles/${article.id}`, { ...article, isPublished: !article.isPublished });
      setArticles(articles.map((a) => (a.id === article.id ? data : a)));
    } catch {
      toast.error('Erreur');
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Articles santé</h2>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: '', content: '', category: 'general', isPublished: false }); }}
          className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          + Nouveau
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <h3 className="font-bold text-gray-900">{editingId ? 'Modifier' : 'Créer'} un article</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
            <textarea className="input-field" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="accent-primary-500" />
            <span className="text-sm text-gray-700">Publier immédiatement</span>
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? '...' : 'Enregistrer'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="card h-16 bg-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {articles.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-gray-900 text-sm leading-tight">{a.title}</p>
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${a.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {a.isPublished ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{a.category}</p>
              <div className="flex gap-2">
                <button onClick={() => togglePublish(a)} className={`flex-1 text-xs font-semibold py-1.5 rounded-xl ${a.isPublished ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                  {a.isPublished ? 'Dépublier' : 'Publier'}
                </button>
                <button onClick={() => editArticle(a)} className="flex-1 bg-blue-100 text-blue-700 text-xs font-semibold py-1.5 rounded-xl">Modifier</button>
                <button onClick={() => deleteArticle(a.id)} className="flex-1 bg-red-100 text-red-600 text-xs font-semibold py-1.5 rounded-xl">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
