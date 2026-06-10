import { useState, useEffect, useCallback } from 'react';
import { Ticket, Plus, X, Bell, BellOff, Navigation, MapPin, Star, Trash2, Clock, Plane, ShieldCheck, RefreshCw, Copy, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import usePushNotifications from '../hooks/usePushNotifications';

// ── Airline logo mapping (using logo.clearbit.com CDN) ───────────────────────
const AIRLINE_LOGOS = {
  'Air India':          'https://logo.clearbit.com/airindia.in',
  'IndiGo':             'https://logo.clearbit.com/goindigo.in',
  'SpiceJet':           'https://logo.clearbit.com/spicejet.com',
  'Vistara':            'https://logo.clearbit.com/airvistara.com',
  'Emirates':           'https://logo.clearbit.com/emirates.com',
  'Qatar Airways':      'https://logo.clearbit.com/qatarairways.com',
  'Lufthansa':          'https://logo.clearbit.com/lufthansa.com',
  'British Airways':    'https://logo.clearbit.com/britishairways.com',
  'Singapore Airlines': 'https://logo.clearbit.com/singaporeair.com',
  'Turkish Airlines':   'https://logo.clearbit.com/turkishairlines.com',
  'Go First':           'https://logo.clearbit.com/gofirst.in',
  'Etihad Airways':     'https://logo.clearbit.com/etihad.com',
  'Malaysia Airlines':  'https://logo.clearbit.com/malaysiaairlines.com',
};

const getIATACode = (airportStr) => {
  if (!airportStr) return '';
  const match = airportStr.match(/\(([A-Z]{3})\)/);
  return match ? match[1] : airportStr.slice(0, 3).toUpperCase();
};

// ── Generate a random pass code ─────────────────────────────────────────────
const generatePassCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = [4, 4, 4];
  return segments.map(len => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')).join('-');
};

function minutesUntil(dt) {
  return Math.round((new Date(dt) - Date.now()) / 60000);
}

function BoardingPassCard({ pass, onDelete, onNavigate }) {
  const flight = pass.flightId;
  const mins = minutesUntil(pass.boardingTime);
  const isUrgent = mins > 0 && mins <= 45;
  const isPast = mins < 0;

  const srcCode = getIATACode(flight?.sourceAirport);
  const dstCode = getIATACode(flight?.destinationAirport);
  const logoUrl = flight?.airlineName ? AIRLINE_LOGOS[flight.airlineName] : null;

  return (
    <div className={`rounded-[2rem] overflow-hidden shadow-xl border bg-white ${isUrgent ? 'border-amber-300 shadow-amber-100' : isPast ? 'border-slate-200 opacity-75' : 'border-indigo-100 shadow-indigo-100'}`}>
      
      {/* ── Top Section (Header) ── */}
      <div className={`px-6 py-5 ${isUrgent ? 'bg-gradient-to-br from-amber-500 to-orange-500' : isPast ? 'bg-gradient-to-br from-slate-500 to-slate-600' : 'bg-gradient-to-br from-navy-900 to-indigo-800'}`}>
        <div className="flex justify-between items-center text-white mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 overflow-hidden shadow-inner">
                {logoUrl ? (
                  <img src={logoUrl} alt={flight?.airlineName} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                ) : null}
                <Plane className={`w-5 h-5 text-indigo-600 ${logoUrl ? 'hidden' : 'block'}`} />
             </div>
             <div>
               <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-200">{flight?.airlineName}</p>
               <p className="text-xl font-bold tracking-tight">{flight?.flightNumber}</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-indigo-200 font-semibold uppercase tracking-widest">Class</p>
             <p className="text-lg font-extrabold uppercase">{pass.boardingClass}</p>
          </div>
        </div>

        {/* Big Route Display */}
        <div className="flex items-center justify-between text-white">
          <div className="text-center">
            <p className="text-4xl font-black tracking-tight">{srcCode}</p>
            <p className="text-[10px] font-medium text-indigo-200 truncate max-w-[80px]">{flight?.sourceAirport?.split(' (')[0]}</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center px-4">
             <div className="w-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full border-2 border-indigo-300 flex-shrink-0" />
                <div className="flex-1 border-t-2 border-dashed border-indigo-300 relative">
                   <Plane className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-200 drop-shadow" />
                </div>
                <div className="w-2 h-2 rounded-full border-2 border-indigo-300 flex-shrink-0" />
             </div>
             <p className="text-xs font-semibold text-indigo-200 mt-2 flex flex-col items-center">
               <span className="text-[9px] uppercase tracking-wider mb-0.5">Departure</span>
               {flight?.departureTime && new Date(flight.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
             </p>
          </div>

          <div className="text-center">
            <p className="text-4xl font-black tracking-tight">{dstCode}</p>
            <p className="text-[10px] font-medium text-indigo-200 truncate max-w-[80px]">{flight?.destinationAirport?.split(' (')[0]}</p>
          </div>
        </div>

        {isUrgent && (
          <div className="mt-5 bg-white/20 rounded-xl px-4 py-2.5 text-sm font-bold animate-pulse text-white text-center flex items-center justify-center gap-2 backdrop-blur-sm border border-white/30">
            <Clock className="w-4 h-4" /> Boarding in {mins} min — Head to Gate {pass.gate} now!
          </div>
        )}
      </div>

      {/* ── Tear Line ── */}
      <div className="flex items-center bg-white relative h-0">
        <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 absolute -left-3 shadow-inner" />
        <div className="w-full border-t-2 border-dashed border-slate-300 mx-4" />
        <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 absolute -right-3 shadow-inner" />
      </div>

      {/* ── Ticket Details ── */}
      <div className="bg-white px-8 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Gate</p>
            <p className="font-black text-3xl text-navy-900">{pass.gate || flight?.gate || 'TBA'}</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Terminal</p>
            <p className="font-bold text-2xl text-navy-900 mt-1">{flight?.terminal?.replace('Terminal ', 'T') || 'TBA'}</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Seat</p>
            <p className="font-black text-3xl text-indigo-600">{pass.seatNumber}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex justify-between items-center border border-slate-100">
           <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Passenger</p>
              <p className="font-bold text-slate-800 text-base uppercase">{pass.passengerName}</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Boarding Time</p>
              <p className="font-bold text-slate-800 text-lg">
                {new Date(pass.boardingTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
           </div>
        </div>

        {/* Owner Pass Code Block */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Owner Pass Code
                </p>
                <p className="font-mono font-black text-slate-800 text-base tracking-[0.18em] uppercase truncate">
                  {pass.passCode || '—'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(pass.passCode || '');
                toast.success('Pass code copied!');
              }}
              className="shrink-0 w-9 h-9 flex items-center justify-center bg-white border border-amber-200 text-amber-600 hover:bg-amber-100 rounded-xl transition-all hover:scale-105"
              title="Copy pass code"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-amber-600/70 mt-2">This code is unique to you. Only the pass owner can access this boarding pass.</p>
        </div>

        {/* Barcode & Actions */}
        <div className="flex items-center gap-5">
           <div className="flex-1 text-center">
              {/* Fake Barcode SVG */}
              <div className="w-full h-10 opacity-70 mb-1.5" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48cmVjdCB4PSI0IiB3aWR0aD0iMiIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHJlY3QgeD0iNyIgd2lkdGg9IjUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjxyZWN0IHg9IjE1IiB3aWR0aD0iMSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHJlY3QgeD0iMTgiIHdpZHRoPSI0IiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48cmVjdCB4PSIyNCIgd2lkdGg9IjIiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjxyZWN0IHg9IjI4IiB3aWR0aD0iNSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHJlY3QgeD0iMzQiIHdpZHRoPSIzIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48cmVjdCB4PSI0MCIgd2lkdGg9IjEiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjxyZWN0IHg9IjQyIiB3aWR0aD0iNiIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHJlY3QgeD0iNTEiIHdpZHRoPSIyIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48cmVjdCB4PSI1NSIgd2lkdGg9IjMiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjxyZWN0IHg9IjU5IiB3aWR0aD0iMSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHJlY3QgeD0iNjIiIHdpZHRoPSI0IiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48cmVjdCB4PSI2NyIgd2lkdGg9IjIiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjxyZWN0IHg9IjcwIiB3aWR0aD0iNSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHJlY3QgeD0iNzgiIHdpZHRoPSIyIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48cmVjdCB4PSI4MiIgd2lkdGg9IjMiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==')", backgroundRepeat: 'repeat-x', backgroundSize: 'contain' }}></div>
              <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">{pass.flightId?.flightNumber || 'BLR-PASS'}</p>
           </div>
           
           <div className="flex gap-2 shrink-0">
             <button
               onClick={() => onNavigate(pass.gate || flight?.gate)}
               className="w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200 transition-transform hover:scale-105"
               title="Navigate to Gate"
             >
               <Navigation className="w-5 h-5 ml-px" />
             </button>
             <button
               onClick={() => onDelete(pass._id)}
               className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-full transition-transform hover:scale-105"
               title="Delete Pass"
             >
               <Trash2 className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>

      {/* Nearby Services */}
      {pass.nearbyServices?.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-8 py-5">
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Near Gate {pass.gate || flight?.gate}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pass.nearbyServices.map(svc => (
              <button
                key={svc._id}
                onClick={() => onNavigate(null, svc)}
                className="bg-white border border-slate-200 rounded-xl p-3 text-left hover:border-indigo-400 hover:shadow-md transition-all group flex items-center gap-3"
              >
                <span className="text-xl bg-slate-50 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-100 shrink-0">{svc.icon}</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-indigo-600">{svc.serviceName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] text-slate-500 font-medium">{svc.rating}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BoardingPassPage() {
  const navigate = useNavigate();
  const [passes, setPasses] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ flightId: '', passengerName: '', seatNumber: '', boardingClass: 'Economy', boardingTime: '', gate: '', passCode: '' });

  const { permission, subscribed, loading: pushLoading, error: pushError, supported, subscribe, unsubscribe, sendTestPush } = usePushNotifications();

  const fetchData = useCallback(async () => {
    try {
      const [passRes, flightRes] = await Promise.all([api.get('/boarding-pass'), api.get('/flights?limit=30')]);
      setPasses(passRes.data.data || []);
      setFlights(flightRes.data.data || []);
    } catch { toast.error('Failed to load boarding passes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-fill gate & boarding time when flight is selected
  const handleFlightChange = (flightId) => {
    const f = flights.find(f => f._id === flightId);
    if (f) {
      const boarding = new Date(f.departureTime);
      boarding.setMinutes(boarding.getMinutes() - 45);
      setForm(prev => ({ ...prev, flightId, gate: f.gate || '', boardingTime: boarding.toISOString().slice(0, 16) }));
    } else {
      setForm(prev => ({ ...prev, flightId, gate: '', boardingTime: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.post('/boarding-pass', form);
      toast.success('Boarding pass added!');
      setShowForm(false);
      setForm({ flightId: '', passengerName: '', seatNumber: '', boardingClass: 'Economy', boardingTime: '', gate: '', passCode: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add boarding pass'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/boarding-pass/${id}`);
      toast.success('Boarding pass removed');
      setPasses(prev => prev.filter(p => p._id !== id));
    } catch { toast.error('Failed to remove pass'); }
  };

  const handleNavigate = (gate, service) => {
    if (service) {
      // Navigate to a service by name
      const dest = service.serviceName;
      navigate(`/navigation?dest=${encodeURIComponent(dest)}`);
    } else if (gate) {
      // Navigate to gate node from Entrance
      const gateNode = `Gate ${gate}`;
      navigate(`/navigation?source=Entrance&dest=${encodeURIComponent(gateNode)}`);
    }
  };

  const handleTestPush = async () => {
    try {
      const res = await sendTestPush();
      toast.success(res.message);
    } catch (err) { toast.error(err.message); }
  };

  const upcoming = passes.filter(p => minutesUntil(p.boardingTime) > 0);
  const past = passes.filter(p => minutesUntil(p.boardingTime) <= 0);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Ticket className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">Boarding Pass</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Digital passes + 30-min mobile push alerts</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center justify-center gap-2 px-6 py-3 bg-navy-900 hover:bg-indigo-900 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
          {showForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Add Pass</>}
        </button>
      </div>



      {/* Add Boarding Pass Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
          <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
            Add New Boarding Pass
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Flight <span className="text-rose-500">*</span></label>
                <select required value={form.flightId} onChange={e => handleFlightChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium appearance-none cursor-pointer">
                  <option value="">-- Choose your flight --</option>
                  {flights.map(f => <option key={f._id} value={f._id}>{f.flightNumber} • {f.sourceAirport.split(' ')[0]} → {f.destinationAirport.split(' ')[0]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Passenger Name <span className="text-rose-500">*</span></label>
                <input required type="text" placeholder="As written on your ID" value={form.passengerName}
                  onChange={e => setForm({ ...form, passengerName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Seat</label>
                <input type="text" placeholder="e.g. 12A" value={form.seatNumber}
                  onChange={e => setForm({ ...form, seatNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium uppercase placeholder:normal-case" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Cabin Class</label>
                <select value={form.boardingClass} onChange={e => setForm({ ...form, boardingClass: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium appearance-none cursor-pointer">
                  {['Economy', 'Premium Economy', 'Business', 'First'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Pass Code / Unique Owner ID */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Pass Code <span className="text-rose-500">*</span>
                <span className="ml-2 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Owner ID
                </span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. ABCD-1234-EFGH"
                    value={form.passCode}
                    onChange={e => setForm({ ...form, passCode: e.target.value.toUpperCase() })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 font-mono font-bold tracking-wider uppercase"
                    maxLength={14}
                  />
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
               <Clock className="w-4 h-4 shrink-0" />
               Gate and Boarding Time will be automatically synced with your selected flight.
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-500 hover:text-slate-700 font-bold mr-2">Cancel</button>
              <button type="submit" disabled={submitting} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing</> : 'Generate Pass'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Passes List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : passes.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <Ticket className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-extrabold text-navy-900 mb-2">No passes yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Add your boarding pass to access terminal directions and get a push notification 30 mins before boarding.</p>
          <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold rounded-xl shadow-md">Add First Pass</button>
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Upcoming Flights ({upcoming.length})
              </h2>
              <div className="space-y-8">{upcoming.map(p => <BoardingPassCard key={p._id} pass={p} onDelete={handleDelete} onNavigate={handleNavigate} />)}</div>
            </section>
          )}
          {past.length > 0 && (
            <section className="opacity-80 hover:opacity-100 transition-opacity">
              <h2 className="text-lg font-bold text-slate-500 mb-5 flex items-center gap-2">
                <Plane className="w-4 h-4 text-slate-400" /> Past Flights ({past.length})
              </h2>
              <div className="space-y-8">{past.map(p => <BoardingPassCard key={p._id} pass={p} onDelete={handleDelete} onNavigate={handleNavigate} />)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

