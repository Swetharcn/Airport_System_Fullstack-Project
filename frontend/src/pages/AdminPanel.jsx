import React, { useState, useEffect, useCallback } from 'react'
import { Plane, Briefcase, Users, Plus, Pencil, Trash2, X, Save, AlertTriangle, Shield, PackageSearch, CheckCircle2 } from 'lucide-react'
import api from '../api/axiosInstance'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

// ─── Flight Form Modal ─────────────────────────────────────────────────────────
const FLIGHT_DEFAULTS = {
  flightNumber: '', airlineName: '', sourceAirport: '', destinationAirport: '',
  departureTime: '', arrivalTime: '', terminal: '', gate: 'TBA',
  flightStatus: 'On Time', aircraft: 'Boeing 737', price: '',
}
const STATUS_OPTIONS = ['On Time', 'Delayed', 'Cancelled', 'Boarding', 'Departed', 'Arrived']

function FlightModal({ flight, onClose, onSave }) {
  const [form, setForm]     = useState(flight || FLIGHT_DEFAULTS)
  const [loading, setLoading] = useState(false)
  const isEdit = !!flight?._id

  const toInputDate = (d) => d ? new Date(d).toISOString().slice(0, 16) : ''

  useEffect(() => {
    if (flight) {
      setForm({ ...flight, departureTime: toInputDate(flight.departureTime), arrivalTime: toInputDate(flight.arrivalTime) })
    }
  }, [flight])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await api.put(`/flights/${flight._id}`, form)
        toast.success('Flight updated!')
      } else {
        await api.post('/flights', form)
        toast.success('Flight created!')
      }
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-navy-900 to-indigo-900 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Plane className="w-5 h-5" /> {isEdit ? 'Edit Flight' : 'Add New Flight'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'flightNumber',      label: 'Flight Number',   placeholder: 'AI202'        },
            { name: 'airlineName',       label: 'Airline Name',    placeholder: 'Air India'    },
            { name: 'sourceAirport',     label: 'From',            placeholder: 'Mumbai (BOM)' },
            { name: 'destinationAirport',label: 'To',              placeholder: 'Delhi (DEL)'  },
            { name: 'terminal',          label: 'Terminal',        placeholder: 'Terminal A'   },
            { name: 'gate',              label: 'Gate',            placeholder: 'A12'          },
            { name: 'aircraft',          label: 'Aircraft',        placeholder: 'Boeing 737'   },
            { name: 'price',             label: 'Price (₹)',       placeholder: '4500', type: 'number' },
          ].map(({ name, label, placeholder, type = 'text' }) => (
            <div key={name}>
              <label className="form-label">{label}</label>
              <input name={name} type={type} className="form-input" placeholder={placeholder} value={form[name]} onChange={handleChange} required={['flightNumber','airlineName','sourceAirport','destinationAirport','terminal'].includes(name)} />
            </div>
          ))}
          <div>
            <label className="form-label">Departure Time</label>
            <input name="departureTime" type="datetime-local" className="form-input" value={form.departureTime} onChange={handleChange} required />
          </div>
          <div>
            <label className="form-label">Arrival Time</label>
            <input name="arrivalTime" type="datetime-local" className="form-input" value={form.arrivalTime} onChange={handleChange} required />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Status</label>
            <select name="flightStatus" className="form-input" value={form.flightStatus} onChange={handleChange}>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : isEdit ? 'Update Flight' : 'Create Flight'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Service Form Modal ────────────────────────────────────────────────────────
const SERVICE_DEFAULTS = {
  serviceName: '', category: 'Restaurant', location: '', description: '',
  openingHours: '24/7', contact: '', icon: '🏢', rating: 4.0,
}
const SERVICE_CATEGORIES = ['Restaurant', 'Lounge', 'Terminal', 'Retail', 'Medical', 'Transport', 'Hotel', 'Banking']

function ServiceModal({ service, onClose, onSave }) {
  const [form, setForm]     = useState(service || SERVICE_DEFAULTS)
  const [loading, setLoading] = useState(false)
  const isEdit = !!service?._id

  useEffect(() => { if (service) setForm(service) }, [service])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await api.put(`/services/${service._id}`, form)
        toast.success('Service updated!')
      } else {
        await api.post('/services', form)
        toast.success('Service created!')
      }
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-navy-900 to-indigo-900 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> {isEdit ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Service Name</label>
              <input name="serviceName" className="form-input" placeholder="Sky Lounge" value={form.serviceName} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Icon (Emoji)</label>
              <input name="icon" className="form-input" placeholder="🛋️" value={form.icon} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                {SERVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Rating (0–5)</label>
              <input name="rating" type="number" min="0" max="5" step="0.1" className="form-input" value={form.rating} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="form-label">Location</label>
            <input name="location" className="form-input" placeholder="Terminal B, Level 3" value={form.location} onChange={handleChange} required />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input resize-none" rows={3} placeholder="Service description..." value={form.description} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Opening Hours</label>
              <input name="openingHours" className="form-input" placeholder="24/7" value={form.openingHours} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Contact</label>
              <input name="contact" className="form-input" placeholder="+91 22..." value={form.contact} onChange={handleChange} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : isEdit ? 'Update Service' : 'Create Service'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ item, type, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-navy-900 mb-2">Delete {type}?</h3>
        <p className="text-sm text-slate-500 mb-6">
          This will permanently delete <strong>{item?.flightNumber || item?.serviceName}</strong>. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleConfirm} disabled={loading} className="btn-danger flex-1 bg-red-600 text-white hover:bg-red-700">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
const statusColors = {
  'On Time':  'bg-emerald-100 text-emerald-700',
  'Delayed':  'bg-amber-100 text-amber-700',
  'Cancelled':'bg-red-100 text-red-700',
  'Boarding': 'bg-blue-100 text-blue-700',
  'Departed': 'bg-slate-100 text-slate-600',
  'Arrived':  'bg-purple-100 text-purple-700',
}

// ─── Main AdminPanel ───────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [tab,      setTab]      = useState('flights')
  const [flights,  setFlights]  = useState([])
  const [services, setServices] = useState([])
  const [users,    setUsers]    = useState([])
  const [lostItems, setLostItems] = useState([])
  const [loading,  setLoading]  = useState(true)

  // Modal state
  const [flightModal,  setFlightModal]  = useState(null)   // null | 'new' | flight object
  const [serviceModal, setServiceModal] = useState(null)
  const [deleteModal,  setDeleteModal]  = useState(null)   // { item, type }

  const loadFlights  = useCallback(async () => {
    const { data } = await api.get('/flights?limit=100')
    setFlights(data.data || [])
  }, [])

  const loadServices = useCallback(async () => {
    const { data } = await api.get('/services')
    setServices(data.data || [])
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUsers([data.user])
    } catch { setUsers([]) }
  }, [])

  const loadLostItems = useCallback(async () => {
    try {
      const { data } = await api.get('/lost-items')
      setLostItems(data.data || [])
    } catch { setLostItems([]) }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadFlights(), loadServices(), loadUsers(), loadLostItems()])
      .finally(() => setLoading(false))
  }, [loadFlights, loadServices, loadUsers, loadLostItems])

  const handleDeleteFlight = async () => {
    await api.delete(`/flights/${deleteModal.item._id}`)
    toast.success('Flight deleted')
    loadFlights()
  }

  const handleDeleteService = async () => {
    await api.delete(`/services/${deleteModal.item._id}`)
    toast.success('Service removed')
    loadServices()
  }

  const TABS = [
    { id: 'flights',  label: 'Flights',  icon: Plane,     count: flights.length  },
    { id: 'services', label: 'Services', icon: Briefcase, count: services.length },
    { id: 'lostfound',label: 'Lost & Found',icon: PackageSearch, count: lostItems.filter(i => i.status !== 'Resolved').length },
    { id: 'users',    label: 'Users',    icon: Users,     count: null            },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Hero */}
      <div className="page-hero py-10">
        <div className="section-container">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Control Panel</h1>
              <p className="text-white/60 mt-0.5">Manage flights, services, and users</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              id={`admin-tab-${id}`}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200 ${
                tab === id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== null && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tab === id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading data..." /></div>
        ) : (
          <>
            {/* ── FLIGHTS TAB ──────────────────────────────────────────────── */}
            {tab === 'flights' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-navy-900">All Flights ({flights.length})</h2>
                  <button id="add-flight-btn" onClick={() => setFlightModal('new')} className="btn-primary">
                    <Plus className="w-4 h-4" /> Add Flight
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          {['Flight #', 'Airline', 'Route', 'Departure', 'Terminal', 'Status', 'Actions'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {flights.map((f) => (
                          <tr key={f._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-bold text-navy-900">{f.flightNumber}</td>
                            <td className="px-4 py-3 text-slate-600">{f.airlineName}</td>
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{f.sourceAirport} → {f.destinationAirport}</td>
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                              {new Date(f.departureTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{f.terminal}</td>
                            <td className="px-4 py-3">
                              <span className={`status-badge ${statusColors[f.flightStatus] || 'bg-slate-100 text-slate-600'}`}>{f.flightStatus}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button id={`edit-flight-${f._id}`} onClick={() => setFlightModal(f)} className="btn-edit py-1.5 px-3 text-xs">
                                  <Pencil className="w-3 h-3" /> Edit
                                </button>
                                <button id={`delete-flight-${f._id}`} onClick={() => setDeleteModal({ item: f, type: 'Flight' })} className="btn-danger py-1.5 px-3 text-xs">
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {flights.length === 0 && (
                      <div className="text-center py-12 text-slate-400">No flights found. Add one above!</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── SERVICES TAB ──────────────────────────────────────────────── */}
            {tab === 'services' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-navy-900">All Services ({services.length})</h2>
                  <button id="add-service-btn" onClick={() => setServiceModal('new')} className="btn-primary">
                    <Plus className="w-4 h-4" /> Add Service
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          {['Icon', 'Service Name', 'Category', 'Location', 'Hours', 'Rating', 'Actions'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {services.map((s) => (
                          <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-xl">{s.icon}</td>
                            <td className="px-4 py-3 font-medium text-navy-900">{s.serviceName}</td>
                            <td className="px-4 py-3">
                              <span className="status-badge bg-indigo-50 text-indigo-700">{s.category}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{s.location}</td>
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.openingHours}</td>
                            <td className="px-4 py-3 text-amber-600 font-semibold">★ {s.rating}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button id={`edit-service-${s._id}`} onClick={() => setServiceModal(s)} className="btn-edit py-1.5 px-3 text-xs">
                                  <Pencil className="w-3 h-3" /> Edit
                                </button>
                                <button id={`delete-service-${s._id}`} onClick={() => setDeleteModal({ item: s, type: 'Service' })} className="btn-danger py-1.5 px-3 text-xs">
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {services.length === 0 && (
                      <div className="text-center py-12 text-slate-400">No services found. Add one above!</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── LOST & FOUND TAB ────────────────────────────────────────────── */}
            {tab === 'lostfound' && (
              <div>
                <h2 className="text-lg font-bold text-navy-900 mb-4">Lost & Found Reports ({lostItems.length})</h2>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          {['ID', 'Item', 'Reported By', 'Location', 'Status', 'Actions'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {lostItems.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.trackingId}</td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-navy-900">{item.itemName}</p>
                              <p className="text-xs text-slate-500 truncate max-w-[150px]">{item.description}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-700">{item.userId?.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-500">{item.contactEmail}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{item.location}</td>
                            <td className="px-4 py-3">
                              <select 
                                value={item.status}
                                onChange={async (e) => {
                                  try {
                                    await api.put(`/lost-items/${item._id}`, { status: e.target.value });
                                    toast.success('Status updated');
                                    loadLostItems();
                                  } catch(err) {
                                    toast.error('Failed to update status');
                                  }
                                }}
                                className={`text-xs font-bold rounded-lg border-none focus:ring-2 focus:ring-indigo-500 outline-none ${
                                  item.status === 'Reported' ? 'bg-slate-100 text-slate-700' :
                                  item.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                                  item.status === 'Found' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-indigo-100 text-indigo-700'
                                }`}
                              >
                                <option value="Reported">Reported</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Found">Found</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => {
                                const note = prompt('Add admin note for this item:');
                                if (note) {
                                  api.put(`/lost-items/${item._id}`, { adminNotes: note })
                                    .then(() => { toast.success('Note added'); loadLostItems(); })
                                    .catch(() => toast.error('Failed to add note'));
                                }
                              }} className="btn-secondary py-1.5 px-3 text-xs">
                                Add Note
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {lostItems.length === 0 && (
                      <div className="text-center py-12 text-slate-400">No lost item reports.</div>
                    )}
                  </div>
                </div>
              </div>
            )}


            {/* ── USERS TAB ──────────────────────────────────────────────────── */}
            {tab === 'users' && (
              <div>
                <h2 className="text-lg font-bold text-navy-900 mb-4">Registered Users</h2>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {users[0]?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">{users[0]?.name}</p>
                      <p className="text-sm text-slate-500">{users[0]?.email}</p>
                    </div>
                    <span className="ml-auto status-badge bg-indigo-100 text-indigo-700 capitalize">{users[0]?.role}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-4 text-center">
                    Full user management (list all users, activate/deactivate) requires a dedicated <code>/api/users</code> endpoint. This tab currently shows the authenticated admin profile.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {flightModal !== null && (
        <FlightModal
          flight={flightModal !== 'new' ? flightModal : null}
          onClose={() => setFlightModal(null)}
          onSave={loadFlights}
        />
      )}
      {serviceModal !== null && (
        <ServiceModal
          service={serviceModal !== 'new' ? serviceModal : null}
          onClose={() => setServiceModal(null)}
          onSave={loadServices}
        />
      )}
      {deleteModal && (
        <DeleteConfirmModal
          item={deleteModal.item}
          type={deleteModal.type}
          onClose={() => setDeleteModal(null)}
          onConfirm={deleteModal.type === 'Flight' ? handleDeleteFlight : handleDeleteService}
        />
      )}
    </div>
  )
}
