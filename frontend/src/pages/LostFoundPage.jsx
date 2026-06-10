import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { PackageSearch, Plus, MapPin, Search, CheckCircle2, Clock, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LostFoundPage() {
  const [items, setItems] = useState([]);
  const [publicItems, setPublicItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('my-reports');
  
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Other',
    location: '',
    description: '',
    contactEmail: ''
  });

  const fetchItems = async () => {
    try {
      const [myRes, pubRes] = await Promise.all([
        api.get('/lost-items/my'),
        api.get('/lost-items/public')
      ]);
      setItems(myRes.data.data);
      setPublicItems(pubRes.data.data);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lost-items', formData);
      toast.success('Lost item reported successfully');
      setShowForm(false);
      setFormData({ itemName: '', category: 'Other', location: '', description: '', contactEmail: '' });
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error reporting item');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Reported': return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200 flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> Reported</span>;
      case 'In Progress': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1 w-max"><Search className="w-3 h-3"/> In Progress</span>;
      case 'Found': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> Found!</span>;
      case 'Resolved': return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200 flex items-center gap-1 w-max"><PackageSearch className="w-3 h-3"/> Returned</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-xl">
            <PackageSearch className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lost & Found</h1>
            <p className="text-slate-500">Report missing items or track your existing reports.</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          {showForm ? 'Cancel Report' : <><Plus className="w-5 h-5" /> Report Lost Item</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Report a Lost Item</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What did you lose?</label>
                <input required type="text" placeholder="e.g. Blue North Face Backpack"
                  value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  {['Electronics', 'Bag', 'Document', 'Clothing', 'Jewellery', 'Keys', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Where did you lose it?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input required type="text" placeholder="e.g. Near Gate B4"
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input required type="email" placeholder="your@email.com"
                  value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
              <textarea required rows={3} placeholder="Provide any unique identifiers, serial numbers, contents..."
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm">
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('my-reports')}
          className={`pb-3 px-2 font-medium transition-colors border-b-2 -mb-px ${activeTab === 'my-reports' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <div className="flex items-center gap-2"><Inbox className="w-4 h-4" /> My Reports</div>
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`pb-3 px-2 font-medium transition-colors border-b-2 -mb-px ${activeTab === 'public' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Found Items Board</div>
        </button>
      </div>

      <div>
        {activeTab === 'my-reports' ? (
          <>
        
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <PackageSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-lg text-slate-600">No reported items</p>
            <p className="text-sm">You haven't reported any lost items yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map(item => (
              <div key={item._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{item.itemName}</h3>
                    <p className="text-sm text-slate-500 mt-1 font-mono bg-slate-100 px-2 py-0.5 rounded inline-block border border-slate-200">
                      ID: {item.trackingId}
                    </p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{item.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-400" /> Lost at: <strong className="text-slate-700">{item.location}</strong></div>
                  
                  {item.foundLocation && (
                    <div className="flex items-center gap-1.5 ml-auto text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" /> Pick up at: <strong className="text-emerald-800">{item.foundLocation}</strong>
                    </div>
                  )}
                </div>
                
                {item.adminNotes && (
                  <div className="mt-3 text-sm bg-indigo-50 border border-indigo-100 text-indigo-800 p-3 rounded-xl flex items-start gap-2">
                    <span className="font-bold flex-shrink-0">Admin Note:</span> {item.adminNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
          </>
        ) : (
          <>
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : publicItems.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-lg text-slate-600">No found items</p>
            <p className="text-sm">There are currently no items recovered by airport authorities.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {publicItems.map(item => (
              <div key={item._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{item.itemName}</h3>
                    <p className="text-sm text-slate-500 mt-1 font-mono bg-slate-100 px-2 py-0.5 rounded inline-block border border-slate-200">
                      ID: {item.trackingId}
                    </p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{item.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5"><PackageSearch className="w-4 h-4 text-slate-400" /> Category: <strong className="text-slate-700">{item.category}</strong></div>
                  
                  {item.foundLocation && (
                    <div className="flex items-center gap-1.5 ml-auto text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" /> Available at: <strong className="text-emerald-800">{item.foundLocation}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
