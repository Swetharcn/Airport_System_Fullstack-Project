import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bell, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationBell({ scrolled }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/api/notifications?limit=1');
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notification count');
    }
  };

  const fetchLatestNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/notifications?limit=5');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => {
    if (!dropdownOpen) {
      fetchLatestNotifications();
    }
    setDropdownOpen(!dropdownOpen);
  };

  const markAsRead = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      toast.error('Error marking as read');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className={`relative p-2 rounded-full transition-colors ${
          scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/90 hover:bg-white/20'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm">No notifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map(notif => (
                    <div key={notif._id} className={`p-4 hover:bg-slate-50 transition-colors block ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 text-xl">{notif.icon}</div>
                        <div className="flex-1">
                          <p className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2">
                            {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <button onClick={(e) => markAsRead(notif._id, e)} className="text-indigo-600 hover:text-indigo-800 p-1" title="Mark as read">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Link 
              to="/notifications" 
              onClick={() => setDropdownOpen(false)}
              className="block p-3 text-center text-sm font-medium text-indigo-600 bg-slate-50 hover:bg-indigo-50 transition-colors border-t border-slate-100"
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
