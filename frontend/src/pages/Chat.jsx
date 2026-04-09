import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../services/api';
import useAuthStore from '../stores/authStore';
import { useSocket } from '../hooks/useSocket';

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    loadMessages();

    if (socket) {
      socket.emit('join_conversation', { conversationId });

      socket.on('new_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on('typing', ({ userId: uid, isTyping: t }) => {
        if (uid !== user?.id) setIsTyping(t);
      });

      return () => {
        socket.off('new_message');
        socket.off('typing');
      };
    }
  }, [conversationId, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages() {
    try {
      const [msgRes, convRes] = await Promise.all([
        api.get(`/conversations/${conversationId}/messages`),
        api.get('/conversations'),
      ]);
      setMessages(msgRes.data.messages);
      const conv = convRes.data.find((c) => c.id === conversationId);
      setConversation(conv);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value);
    if (socket) {
      socket.emit('typing', { conversationId, isTyping: true });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('typing', { conversationId, isTyping: false });
      }, 2000);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input;
    setInput('');

    if (socket) {
      socket.emit('send_message', { conversationId, content, type: 'TEXT' });
    } else {
      try {
        const { data } = await api.post(`/conversations/${conversationId}/messages`, { content });
        setMessages((prev) => [...prev, data]);
      } catch {}
    }
  }

  const otherPerson = conversation
    ? user?.role === 'PATIENT'
      ? `Dr ${conversation.doctor?.prenom} ${conversation.doctor?.nom}`
      : `${conversation.patient?.prenom} ${conversation.patient?.nom}`
    : 'Chat';

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white">
      {/* Header */}
      <div className="bg-primary-500 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="text-white text-xl">←</button>
        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-lg">
          {user?.role === 'PATIENT' ? '👨‍⚕️' : '👤'}
        </div>
        <div>
          <p className="font-semibold text-sm">{otherPerson}</p>
          {isTyping && <p className="text-xs text-primary-200">En train d'écrire...</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">Commencez la conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                    {format(new Date(msg.createdAt), 'HH:mm', { locale: fr })}
                    {isMe && (msg.isRead ? ' ✓✓' : ' ✓')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
        <input
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-300 transition"
          placeholder="Votre message..."
          value={input}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 flex-shrink-0"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
