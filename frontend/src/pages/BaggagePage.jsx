import { useState, useEffect } from 'react';
import { Luggage, Plus, X, AlertTriangle, CheckCircle2, Clock, Plane, Package, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const ALL_STAGES = [
  { key: 'Checked-in', label: 'Checked In', icon: '🧳' },
  { key: 'Security Screening', label: 'Security', icon: '🔍' },
  { key: 'Loaded on Aircraft', label: 'Loaded', icon: '✈️' },
  { key: 'In Transit', label: 'In Transit', icon: '🛫' },
  { key: 'Arrived at Destination', label: 'Arrived', icon: '🛬' },
  { key: 'At Baggage Claim Belt', label: 'Claim Belt', icon: '🔄' },
  { key: 'Collected', label: 'Collected', icon: '✅' },
];

const STATUS_COLORS = {
  'Checked-in': 'bg-blue-100 text-blue-700 border-blue-200',
  'Security Screening': 'bg-purple-100 text-purple-700 border-purple-200',
  'Loaded on Aircraft': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'In Transit': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Arrived at Destination': 'bg-teal-100 text-teal-700 border-teal-200',
  'At Baggage Claim Belt': 'bg-amber-100 text-amber-700 border-amber-200',
  'Collected': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Missing': 'bg-rose-100 text-rose-700 border-rose-200',
};

function Stepper({ status }) {
  const idx = ALL_STAGES.findIndex(s => s.key === status);
  const missing = status === 'Missing';
  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex items-center min-w-max gap-0">
        {ALL_STAGES.map((stage, i) => {
          const done = !missing && i < idx;
          const active = !missing && i === idx;
          const nodeClass = missing
            ? 'bg-slate-100 text-slate-400'
            : done
            ? 'bg-emerald-500 text-white'
            : active
            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
            : 'bg-slate-100 text-slate-400';
          const labelClass = active
            ? 'text-indigo-700 font-bold'
            : done
            ? 'text-emerald-600'
            : 'text-slate-400';
          const lineClass = !missing && i < idx ? 'bg-emerald-400' : 'bg-slate-200';
          return (
            <div key={stage.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all ${nodeClass}`}>
                  {done ? '✓' : stage.icon}
                </div>
                <span className={`text-[10px] font-medium text-center max-w-[52px] leading-tight ${labelClass}`}>
                  {stage.label}
                </span>
              </div>
              {i < ALL_STAGES.length - 1 && (
                <div className={`h-0.5 w-8 mx-1 rounded-full mb-5 ${lineClass}`} />
              )}
            </div>
          );
        })}
        {missing && (
          <div className="ml-4 flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
            <span className="text-rose-700 text-sm font-bold">⚠️ MISSING</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BagCard({ bag }) {
  const [open, setOpen] = useState(false);
  const flight = bag.flightId;
  const borderClass = bag.status === 'Missing' ? 'border-rose-200' : 'border-slate-200';
  const statusClass = STATUS_COLORS[bag.status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${borderClass}`}>
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
              {bag.status === 'Missing' ? '⚠️' : '🧳'}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{bag.description}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Tag: <strong className="text-slate-700">{bag.tagNumber}</strong> · {bag.baggageId}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${statusClass}`}>
            {bag.status}
          </span>
        </div>

        <Stepper status={bag.status} />

        {flight && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-indigo-400" />
              <strong className="text-slate-800">{flight.flightNumber}</strong> ({flight.airlineName})
            </span>
            <span>{flight.sourceAirport} → {flight.destinationAirport}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {new Date(flight.departureTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <span className="ml-auto font-medium">📍 {bag.currentLocation}</span>
          </div>
        )}

        {bag.status === 'Missing' && (
          <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-rose-800">Baggage marked as missing</p>
              <p className="text-rose-700 mt-0.5">
                A Lost &amp; Found report has been automatically created.
                {bag.lostItemId && <span> Ref: <strong>{bag.lostItemId.trackingId}</strong></span>}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors py-1.5"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {open ? 'Hide' : 'View'} Status History ({bag.statusHistory?.length || 0} events)
        </button>
      </div>

      {open && bag.statusHistory?.length > 0 && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 bg-slate-50">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Status Timeline</h4>
          <ol className="relative border-l-2 border-indigo-200 ml-3 space-y-4">
            {[...bag.statusHistory].reverse().map((ev, i) => (
              <li key={i} className="pl-5 relative">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-400 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </span>
                <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-800">{ev.status}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(ev.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{ev.note}</p>
                  <p className="text-xs text-slate-400 mt-1">📍 {ev.location} · {ev.updatedBy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function BaggagePage() {
  const [bags, setBags] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ flightId: '', description: '', tagNumber: '', weight: '' });

  const fetchData = async () => {
    try {
      const [bagsRes, flightsRes] = await Promise.all([
        api.get('/baggage/user/me'),
        api.get('/flights?limit=30'),
      ]);
      setBags(bagsRes.data.data || []);
      setFlights(flightsRes.data.data || []);
    } catch {
      toast.error('Failed to load baggage data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/baggage/register', form);
      toast.success('Baggage registered!');
      setShowForm(false);
      setForm({ flightId: '', description: '', tagNumber: '', weight: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register baggage');
    } finally {
      setSubmitting(false);
    }
  };

  const activeBags = bags.filter(b => b.status !== 'Collected');
  const collectedBags = bags.filter(b => b.status === 'Collected');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Luggage className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Baggage</h1>
            <p className="text-slate-500 text-sm mt-0.5">Real-time tracking with full status history</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          {showForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Register Baggage</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active', count: activeBags.length, icon: '🛫', cls: 'from-indigo-50 to-blue-50 border-indigo-100' },
          { label: 'Collected', count: collectedBags.length, icon: '✅', cls: 'from-emerald-50 to-teal-50 border-emerald-100' },
          { label: 'Missing', count: bags.filter(b => b.status === 'Missing').length, icon: '⚠️', cls: 'from-rose-50 to-orange-50 border-rose-100' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.cls} border rounded-2xl p-4 text-center`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-slate-800">{s.count}</div>
            <div className="text-xs text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Register Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" /> Register New Baggage
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Flight *</label>
                <select
                  required value={form.flightId}
                  onChange={e => setForm({ ...form, flightId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">-- Choose a flight --</option>
                  {flights.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.flightNumber} — {f.sourceAirport} → {f.destinationAirport} ({f.airlineName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bag Tag Number</label>
                <input
                  type="text" placeholder="e.g. TAG-1234 (auto-assigned if blank)"
                  value={form.tagNumber} onChange={e => setForm({ ...form, tagNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input
                  required type="text" placeholder="e.g. Black Samsonite trolley with red ribbon"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number" min="0" max="50" placeholder="e.g. 23"
                  value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
              >
                {submitting ? 'Registering...' : 'Register Baggage'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bags.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Luggage className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">No baggage registered</h3>
          <p className="text-slate-400 mb-6">Register your first bag to start tracking it in real-time.</p>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl">
            Register Now
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {activeBags.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Active Bags ({activeBags.length})
              </h2>
              <div className="space-y-4">
                {activeBags.map(b => <BagCard key={b._id} bag={b} />)}
              </div>
            </section>
          )}
          {collectedBags.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Collected Bags ({collectedBags.length})
              </h2>
              <div className="space-y-4">
                {collectedBags.map(b => <BagCard key={b._id} bag={b} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
