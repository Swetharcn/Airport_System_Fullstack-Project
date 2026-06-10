import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Search, MapPin, Navigation, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import AirportMapSVG from '../components/AirportMapSVG';

export default function NavigationPage() {
  const [searchParams] = useSearchParams();
  const [nodes, setNodes] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-fill source and destination from query params (used by Boarding Pass page)
  useEffect(() => {
    const srcParam = searchParams.get('source');
    const destParam = searchParams.get('dest');
    if (srcParam) setSource(srcParam);
    if (destParam) setDestination(destParam);
  }, [searchParams]);

  // Fetch all navigable nodes on mount
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await api.get('/navigation/nodes');
        setNodes(res.data.data);
      } catch (err) {
        toast.error('Failed to load airport map data');
      }
    };
    fetchNodes();
  }, []);

  const findRoute = async (e) => {
    e.preventDefault();
    if (source === destination) {
      return toast.error('Source and destination cannot be the same');
    }

    setLoading(true);
    setRoute(null);
    try {
      const res = await api.get(`/navigation/path?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
      setRoute(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error finding route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Navigation className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Indoor Navigation</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Route Planner */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Plan Your Route</h2>
            
            <form onSubmit={findRoute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Point</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    required
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                  >
                    <option value="" disabled>Select starting location...</option>
                    {nodes.map(n => <option key={`src-${n}`} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <button 
                  type="button" 
                  onClick={() => { setSource(destination); setDestination(source); }}
                  className="bg-white border border-slate-200 p-2 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
                  title="Swap locations"
                >
                  <Navigation className="w-4 h-4 text-slate-500 rotate-180" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                  <select
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                  >
                    <option value="" disabled>Select destination...</option>
                    {nodes.map(n => <option key={`dst-${n}`} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !source || !destination}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2 mt-4"
              >
                {loading ? <span className="animate-pulse">Calculating...</span> : <><Search className="w-5 h-5" /> Find Route</>}
              </button>
            </form>
          </div>

          {/* Route Results */}
          {route && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-indigo-50 border-b border-indigo-100 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-indigo-900">Route Found</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-indigo-700 font-medium">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {route.distance}m</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> ~{route.estimatedTimeMinutes} min walk</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <ol className="relative border-l-2 border-indigo-200 ml-3 space-y-6">
                  {route.directions.map((step, idx) => (
                    <li key={idx} className="pl-6 relative">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-[13px] ring-4 ring-white">
                        <div className={`w-2 h-2 rounded-full ${idx === 0 || idx === route.directions.length-1 ? 'bg-indigo-600' : 'bg-indigo-400'}`}></div>
                      </span>
                      <p className={`text-sm ${idx === 0 || idx === route.directions.length-1 ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Interactive Map UI Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col relative">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Terminal Map View</h3>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Diagrammatic layout
            </span>
          </div>
          
          <div className="flex-1 bg-slate-100 p-4 relative flex items-center justify-center overflow-hidden">
            <div className="w-full h-full max-w-2xl mx-auto flex items-center justify-center">
              <AirportMapSVG route={route} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
