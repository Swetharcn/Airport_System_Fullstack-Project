import { useState, useRef } from 'react';
import { Brain, Search, Plane, AlertTriangle, CheckCircle2, Clock, TrendingUp, Info } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const RISK_CONFIG = {
  Low:    { color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', bar: 'bg-emerald-500', from: 'from-emerald-50' },
  Medium: { color: 'text-amber-700',   bg: 'bg-amber-100',   border: 'border-amber-200',   bar: 'bg-amber-500',   from: 'from-amber-50' },
  High:   { color: 'text-rose-700',    bg: 'bg-rose-100',    border: 'border-rose-200',    bar: 'bg-rose-500',    from: 'from-rose-50' },
};

function RiskBadge({ level }) {
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.Low;
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {level} Risk
    </span>
  );
}

function InsightRow({ ins }) {
  const iconMap = {
    danger:  <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
    info:    <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />,
  };
  const bgMap = {
    danger:  'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    success: 'bg-emerald-50 border-emerald-100',
    info:    'bg-blue-50 border-blue-100',
  };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${bgMap[ins.type] || bgMap.info}`}>
      {iconMap[ins.type] || iconMap.info}
      <p className="text-sm text-slate-700">{ins.text}</p>
    </div>
  );
}

function ProbabilityBar({ value, label, colorClass }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function FlightPredictionPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const getBarColor = (prob) => {
    if (prob >= 55) return 'bg-rose-500';
    if (prob >= 30) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return toast.error('Please enter a flight number');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/prediction/search?q=${encodeURIComponent(query.trim())}`);
      setResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Flight not found');
    } finally {
      setLoading(false);
    }
  };

  const p = result?.prediction;
  const f = result?.flight;
  const riskCfg = p ? (RISK_CONFIG[p.gateChangeRisk] || RISK_CONFIG.Low) : null;

  const statusBadgeClass = f
    ? f.status === 'On Time'   ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
    : f.status === 'Delayed'   ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
    : f.status === 'Cancelled' ? 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
    : 'bg-slate-400/20 text-slate-300 border border-slate-400/30'
    : '';

  const metricCards = p ? [
    {
      label: 'Delay Probability', value: p.delayProbability, suffix: '%',
      icon: <TrendingUp className="w-5 h-5" />,
      colorText: p.delayProbability >= 55 ? 'text-rose-600' : p.delayProbability >= 30 ? 'text-amber-600' : 'text-emerald-600',
      bg: p.delayProbability >= 55 ? 'from-rose-50 to-orange-50 border-rose-100' : p.delayProbability >= 30 ? 'from-amber-50 to-yellow-50 border-amber-100' : 'from-emerald-50 to-teal-50 border-emerald-100',
    },
    {
      label: 'Expected Delay', value: p.expectedDelayMinutes, suffix: ' min',
      icon: <Clock className="w-5 h-5" />,
      colorText: p.expectedDelayMinutes > 30 ? 'text-rose-600' : p.expectedDelayMinutes > 0 ? 'text-amber-600' : 'text-emerald-600',
      bg: 'from-blue-50 to-indigo-50 border-blue-100',
    },
    {
      label: 'Model Confidence', value: p.confidence, suffix: '%',
      icon: <Brain className="w-5 h-5" />,
      colorText: 'text-violet-600',
      bg: 'from-violet-50 to-purple-50 border-violet-100',
    },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-200">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Flight Predictor</h1>
          <p className="text-slate-500 text-sm mt-0.5">Predict delays and gate changes using intelligent rule-based analysis</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <label className="block text-base font-semibold text-gray-800 mb-3">Search by Flight Number</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. AI202, EK512, LH763, BA117..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors text-slate-800 placeholder-slate-400"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Search className="w-5 h-5" />
            }
            {loading ? 'Analyzing...' : 'Predict'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3">✨ Try: AI202 (On Time) · BA117 (Delayed) · EK512 (International long-haul)</p>
      </form>

      {/* Results */}
      {result && p && f && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Flight Card */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl font-black tracking-tight">{f.flightNumber}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadgeClass}`}>
                    {f.status}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">{f.airlineName} · {f.aircraft}</p>
                <p className="text-white font-semibold mt-2 text-lg">{f.route}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs mb-1">Departure</p>
                <p className="text-white font-bold">
                  {new Date(f.departureTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <p className="text-slate-300 text-sm mt-1">{f.terminal} · Gate {f.gate}</p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid sm:grid-cols-3 gap-4">
            {metricCards.map(m => (
              <div key={m.label} className={`bg-gradient-to-br ${m.bg} border rounded-2xl p-5 text-center`}>
                <div className={`flex justify-center mb-2 ${m.colorText}`}>{m.icon}</div>
                <div className={`text-4xl font-black ${m.colorText}`}>
                  {m.value}<span className="text-xl">{m.suffix}</span>
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Bar + Gate Risk */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Delay Probability Meter</h3>
              <ProbabilityBar value={p.delayProbability} label="Delay Score" colorClass={getBarColor(p.delayProbability)} />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>Low (0–30%)</span>
                <span>Medium (30–55%)</span>
                <span>High (55%+)</span>
              </div>
            </div>
            <div className={`rounded-2xl border p-5 shadow-sm ${riskCfg.border} bg-gradient-to-br ${riskCfg.from} to-white`}>
              <h3 className="font-bold text-gray-800 mb-3">Gate Change Risk</h3>
              <div className="flex items-center justify-between mb-3">
                <RiskBadge level={p.gateChangeRisk} />
                <span className="text-2xl font-black text-slate-700">{Math.floor(p.delayProbability * 0.6)}%</span>
              </div>
              <p className="text-sm text-slate-600">
                {p.gateChangeRisk === 'High'
                  ? 'Monitor the flight board closely. Gate changes are very likely.'
                  : p.gateChangeRisk === 'Medium'
                  ? 'Gate change is possible. Check boards 45 mins before departure.'
                  : 'Gate change is unlikely. Proceed to the assigned gate.'}
              </p>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-500" /> AI Analysis Insights
            </h3>
            <div className="space-y-3">
              {p.insights.map((ins, i) => <InsightRow key={i} ins={ins} />)}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">{result.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Brain className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">Enter a flight number to begin</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            The AI engine analyses departure time, aircraft type, route history, and real-time congestion to generate predictions.
          </p>
        </div>
      )}
    </div>
  );
}
