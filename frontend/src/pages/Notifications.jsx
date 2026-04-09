import { useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotifications } from '../hooks/useNotifications';

const TYPE_ICONS = {
  APPOINTMENT_CONFIRMED: '📅',
  APPOINTMENT_CANCELLED: '❌',
  PAYMENT_SUCCESS: '💳',
  NEW_MESSAGE: '💬',
  PRESCRIPTION_READY: '📋',
  NEW_APPOINTMENT: '🔔',
  DOCTOR_VERIFIED: '✅',
  DOCTOR_REJECTED: '🚫',
};

export default function Notifications() {
  const { notifications, markAllRead, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        <button onClick={markAllRead} className="text-sm text-primary-600">Tout lire</button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">🔔</p>
          <p className="text-gray-500">Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card flex items-start gap-3 ${!n.isRead ? 'border-l-4 border-l-primary-500' : ''}`}
            >
              <span className="text-2xl flex-shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(n.createdAt), 'd MMM HH:mm', { locale: fr })}
                </p>
              </div>
              {!n.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
