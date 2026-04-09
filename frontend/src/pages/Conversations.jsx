import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../stores/authStore';

export default function Conversations() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/conversations')
      .then(({ data }) => setConversations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function getOtherName(conv) {
    if (user?.role === 'DOCTOR') {
      return `${conv.patient?.prenom || ''} ${conv.patient?.nom || ''}`.trim() || 'Patient';
    }
    return `Dr ${conv.doctor?.prenom || ''} ${conv.doctor?.nom || ''}`.trim();
  }

  function getOtherIcon(conv) {
    return user?.role === 'DOCTOR' ? '👤' : '👨‍⚕️';
  }

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-16 bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Messages</h2>

      {conversations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">💬</p>
          <p className="font-semibold text-gray-700 mb-1">Aucune conversation</p>
          <p className="text-sm text-gray-400">
            Vos échanges avec les {user?.role === 'DOCTOR' ? 'patients' : 'médecins'} apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const lastMsg = conv.messages?.[0];
            const unread = conv.messages?.filter(
              (m) => !m.isRead && m.senderId !== user?.id
            ).length || 0;

            return (
              <Link
                key={conv.id}
                to={`/chat/${conv.id}`}
                className="card flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-xl flex-shrink-0">
                  {getOtherIcon(conv)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                      {getOtherName(conv)}
                    </p>
                    {lastMsg?.createdAt && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {new Date(lastMsg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {lastMsg?.content || 'Démarrer la conversation'}
                  </p>
                </div>

                {unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{unread > 9 ? '9+' : unread}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
