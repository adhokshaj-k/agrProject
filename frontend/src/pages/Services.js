import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Services() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [booking, setBooking] = useState(null);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Testing' });
    const [bookNotes, setBookNotes] = useState('');

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    const fetchServices = async () => {
        setLoading(true);
        try { const r = await api.get('/api/services/'); setServices(r.data); }
        catch { showToast('Failed to load services', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchServices(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/services/', { ...form, price: parseFloat(form.price) });
            showToast('✅ Service listed!'); setShowAdd(false); fetchServices();
        } catch (err) { showToast(err.response?.data?.detail || 'Failed', 'error'); }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!user) { showToast('Please login first', 'error'); return; }
        try {
            await api.post(`/api/services/${booking.id}/book`, { notes: bookNotes });
            showToast(`✅ ${booking.name} booked!`); setBooking(null);
        } catch (err) { showToast(err.response?.data?.detail || 'Failed', 'error'); }
    };

    const SERVICE_ICONS = { Testing: '🧪', Spraying: '🚁', Ploughing: '🚜', Harvesting: '🌾', Other: '🔧' };

    return (
        <div className="page">
            <div className="container">
                {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}

                <div className="page-header">
                    <div>
                        <h1 className="page-title">🔧 <span>Agricultural Services</span></h1>
                        <p className="page-subtitle">Book expert services for your farm — soil testing, spraying, and more.</p>
                    </div>
                    {user && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Offer Service</button>}
                </div>

                {loading ? (
                    <div className="loading-overlay"><div className="spinner" /><p>Loading services...</p></div>
                ) : services.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔧</div>
                        <h3>No services available</h3>
                        <p>Be the first to offer agricultural services</p>
                    </div>
                ) : (
                    <div className="service-grid">
                        {services.map(s => (
                            <div className="service-card" key={s.id}>
                                <div className="service-icon">{SERVICE_ICONS[s.category] || '🔧'}</div>
                                <span className="badge badge-info" style={{ marginBottom: '10px' }}>{s.category || 'Service'}</span>
                                <h3>{s.name}</h3>
                                <p>{s.description || 'Professional agricultural service'}</p>
                                <div className="price-tag">
                                    <span className="price-main">₹{s.price}</span>
                                    <span className="price-unit">/service</span>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => { setBooking(s); setBookNotes(''); }}>
                                    📅 Book Service
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Service Modal */}
                {showAdd && (
                    <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <span className="modal-title">🔧 Offer a Service</span>
                                <button className="modal-close" onClick={() => setShowAdd(false)}>×</button>
                            </div>
                            <form onSubmit={handleAdd}>
                                <div className="form-group">
                                    <label className="form-label">Service Name *</label>
                                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g., Drone Spraying Service" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Service details..." />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Price (₹) *</label>
                                        <input className="form-control" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            {['Testing', 'Spraying', 'Ploughing', 'Harvesting', 'Other'].map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button className="btn btn-primary btn-full" type="submit">🚀 List Service</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Book Service Modal */}
                {booking && (
                    <div className="modal-overlay" onClick={() => setBooking(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <span className="modal-title">📅 Book: {booking.name}</span>
                                <button className="modal-close" onClick={() => setBooking(null)}>×</button>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                                Price: ₹{booking.price}
                            </p>
                            <form onSubmit={handleBook}>
                                <div className="form-group">
                                    <label className="form-label">Additional Notes</label>
                                    <textarea className="form-control" value={bookNotes} onChange={e => setBookNotes(e.target.value)}
                                        placeholder="Describe your requirements, field size, location..." />
                                </div>
                                <button className="btn btn-primary btn-full" type="submit">✅ Confirm Booking</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
