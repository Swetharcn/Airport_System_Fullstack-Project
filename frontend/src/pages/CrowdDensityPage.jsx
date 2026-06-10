import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Users, AlertTriangle, RefreshCw, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import AirportMapSVG from '../components/AirportMapSVG';

export default function CrowdDensityPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDensity = async () => {
    try {
      const res = await api.get('/crowd-density');
      setZones(res.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      toast.error('Failed to load crowd density data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDensity();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDensity, 60000);
    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Low': return 'bg-emerald-500 shadow-emerald-500/30';
      case 'Moderate': return 'bg-amber-400 shadow-amber-400/30';
      case 'High': return 'bg-orange-500 shadow-orange-500/30';
      case 'Critical': return 'bg-rose-500 shadow-rose-500/30 animate-pulse';
      default: return 'bg-slate-400';
    }
  };

  const getTextColor = (category) => {
    switch (category) {
      case 'Low': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Moderate': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'High': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Critical': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  // Check for critical bottlenecks
  const criticalZones = zones.filter(z => z.category === 'Critical' || z.category === 'High');

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Crowd Heatmap</h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> 
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-medium">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div> Low</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div> Mod</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div> High</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></div> Max</div>
        </div>
      </div>

      {criticalZones.length > 0 && (
        <div className="mb-8 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-900">Congestion Alert</h3>
            <p className="text-rose-700 text-sm mt-1">
              High foot traffic detected at: {criticalZones.map(z => z.zone).join(', ')}. Please expect delays or use alternative routes.
            </p>
          </div>
        </div>
      )}

      {loading && zones.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Heatmap Visual representation */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[500px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-gray-700">Terminal Map Overlay</h3>
            </div>
            
            <div className="flex-1 bg-slate-100 p-4 relative flex items-center justify-center overflow-hidden min-h-[500px]">
              <div className="w-full h-full max-w-2xl mx-auto flex items-center justify-center">
                <AirportMapSVG densityZones={zones} />
              </div>
            </div>
          </div>

          {/* List View */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-gray-700">Zone Density Levels</h3>
            </div>
            
            <div className="overflow-y-auto max-h-[500px] p-2">
              {zones.map(zone => (
                <div key={zone._id} className="p-3 mb-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {zone.zone}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{zone.terminal}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTextColor(zone.category)}`}>
                      {zone.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${getCategoryColor(zone.category).split(' ')[0]}`}
                          style={{ width: `${zone.densityLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-8 text-right">{zone.densityLevel}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
