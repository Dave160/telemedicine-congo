import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../services/api';

const CATEGORY_ICONS = {
  nutrition: '🥗',
  grossesse: '🤰',
  maladies: '🦠',
  hygiene: '🧼',
  pediatrie: '👶',
  general: '❤️',
};

export function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = category ? `?category=${category}` : '';
    api.get(`/articles${params}`)
      .then(({ data }) => {
        setArticles(data.articles);
        setCategories(data.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Conseils santé</h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory('')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${!category ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
        >
          Tous
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${category === c ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            {CATEGORY_ICONS[c] || '📰'} {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card h-20 bg-gray-100 animate-pulse" />)}</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-500">Aucun article</p></div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <Link key={a.id} to={`/articles/${a.id}`} className="card block hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{CATEGORY_ICONS[a.category] || '📰'}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {a.category} • {format(new Date(a.createdAt), 'd MMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/articles/${id}`)
      .then(({ data }) => setArticle(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4 text-center text-gray-400">Chargement...</div>;
  if (!article) return <div className="p-4 text-center text-gray-400">Article introuvable</div>;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-primary-500 text-white px-4 py-8 text-center">
        <span className="text-5xl">{CATEGORY_ICONS[article.category] || '📰'}</span>
        <h1 className="text-xl font-bold mt-3 leading-tight">{article.title}</h1>
        <p className="text-primary-200 text-xs mt-2">
          {format(new Date(article.createdAt), 'd MMMM yyyy', { locale: fr })}
        </p>
      </div>
      <div className="p-5">
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {article.content}
        </div>
      </div>
    </div>
  );
}
