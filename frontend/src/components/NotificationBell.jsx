import { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCircle2, XCircle, Banknote, AlertTriangle, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const iconMap = {
  SUCCESS: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
  ERROR: <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
  WARNING: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
  INFO: <Banknote className="w-4 h-4 text-brand-500 flex-shrink-0" />,
};

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [notifsRes, countRes] = await Promise.all([
        axios.get('/api/notifications'),
        axios.get('/api/notifications/unread-count')
      ]);
      setNotifications(notifsRes.data);
      setUnreadCount(countRes.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete('/api/notifications/clear');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const fmtTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => { 
          setOpen(!open); 
          if (!open && unreadCount > 0) markAllRead(); 
        }}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-40 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Notifications</h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAll} 
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Clear All"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`flex items-start gap-3 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-brand-50/30' : ''}`}
                    onClick={() => !n.read && markRead(n.id)}
                  >
                    {iconMap[n.type] || iconMap.INFO}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{fmtTime(n.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
