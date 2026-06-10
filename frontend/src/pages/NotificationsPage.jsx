import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Bell, PlaneTakeoff, Check, Search, CalendarClock, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [flights, setFlights] = useState([]);
  const [myFlights, setMyFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlightId, setSelectedFlightId] = useState('');

  const fetchData = async () => {
    try {
      const [notifRes, myFlightsRes, allFlightsRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/my-flights'),
        api.get('/flights?limit=20')
      ]);
      setNotifications(notifRes.data.data);
      setMyFlights(myFlightsRes.data.data);
      setFlights(allFlightsRes.data.data);
    } catch (error) {
      toast.error('Failed to load notification data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const registerFlight = async (e) => {
    e.preventDefault();
    if (!selectedFlightId) return toast.error('Please select a flight');
    
    try {
      await api.post('/notifications/register-flight', { flightId: selectedFlightId });
      toast.success('Successfully registered for flight alerts');
      setSelectedFlightId('');
      fetchData(); // Refresh both lists
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error registering for flight');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Error updating notifications');
    }
  };

  const getNotifIcon = (type, icon) => {
    if (icon) return <span className="text-2xl">{icon}</span>;
    switch(type) {
      case 'boarding': return <PlaneTakeoff className="w-6 h-6 text-indigo-500" />;
      case 'lost-found': return <Search className="w-6 h-6 text-amber-500" />;
      default: return <Info className="w-6 h-6 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 rounded-xl relative">
          <Bell className="w-8 h-8 text-indigo-600" />
          {notifications.some(n => !n.isRead) && (
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-indigo-100 rounded-full animate-pulse"></span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications & Alerts</h1>
          <p className="text-slate-500">Manage your flight boarding reminders and system alerts.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Inbox */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-800">Inbox</h2>
            {notifications.some(n => !n.isRead) && (
              <button onClick={markAllRead} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <Check className="w-4 h-4" /> Mark all as read
              </button>
            )}
          </div>

          {loading ? (
             <div className="h-40 flex items-center justify-center bg-white rounded-2xl border border-slate-200"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : notifications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
              <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="font-medium text-lg text-slate-600">You're all caught up!</p>
              <p className="text-sm">No new notifications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif._id} className={`flex gap-4 p-4 rounded-2xl border transition-all ${notif.isRead ? 'bg-white border-slate-200 shadow-sm opacity-70 hover:opacity-100' : 'bg-indigo-50/50 border-indigo-200 shadow-md ring-1 ring-indigo-100'}`}>
                  <div className="flex-shrink-0 mt-1">
                    {getNotifIcon(notif.type, notif.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold ${notif.isRead ? 'text-gray-800' : 'text-indigo-900'}`}>{notif.title}</h3>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                        {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-slate-600' : 'text-indigo-800 font-medium'}`}>
                      {notif.message}
                    </p>
                    {notif.metadata?.bookingRef && (
                       <span className="inline-block mt-2 text-xs font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">Ref: {notif.metadata.bookingRef}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Flight Registration */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <PlaneTakeoff className="w-32 h-32" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2 relative z-10">Smart Boarding Alerts</h2>
            <p className="text-sm text-slate-500 mb-6 relative z-10">Subscribe to receive push & email reminders at 90, 60, and 30 minutes before departure.</p>
            
            <form onSubmit={registerFlight} className="space-y-4 relative z-10">
              <select 
                value={selectedFlightId} 
                onChange={(e) => setSelectedFlightId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
              >
                <option value="">Select your flight...</option>
                {flights.map(f => (
                  <option key={f._id} value={f._id}>{f.flightNumber} - {f.destinationAirport}</option>
                ))}
              </select>
              
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2">
                <Bell className="w-5 h-5" /> Enable Reminders
              </button>
            </form>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-indigo-500"/> Active Subscriptions</h3>
            
            {myFlights.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No active flight reminders.</p>
            ) : (
              <div className="space-y-3">
                {myFlights.map(booking => (
                  <div key={booking._id} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-bold text-gray-900">{booking.flightNumber}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">To {booking.flightId?.destinationAirport}</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
