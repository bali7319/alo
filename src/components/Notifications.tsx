import React, { useEffect, useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      });
  }, []);

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id })
    });
    setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (!notifications.length) return <div>Hiç bildiriminiz yok.</div>;

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Bildirimler</h2>
      <ul className="space-y-3">
        {notifications.map(n => (
          <li key={n.id} className={`p-4 rounded border ${n.isRead ? 'bg-gray-100' : 'bg-yellow-50 border-yellow-400'}`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-gray-600">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('tr-TR')}</div>
              </div>
              {!n.isRead && (
                <button
                  className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  onClick={() => markAsRead(n.id)}
                >
                  Okundu
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 
