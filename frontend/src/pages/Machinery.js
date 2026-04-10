import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Machinery() {
    const { user } = useAuth();
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [booking, setBooking] = useState(null);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', daily_rate: '', location: '', category: 'Tractor' });
    const [bookForm, setBookForm] = useState({ start_date: '', end_date: '', notes: '' });

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    const fetchMachines = async () => {
        setLoading(true);
        try { const r = await api.get('/api/machines/'); setMachines(r.data); }
        catch { showToast('Failed to load machines', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchMachines(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/machines/', { ...form, daily_rate: parseFloat(form.daily_rate) });
            showToast('✅ Machine listed!'); setShowAdd(false); fetchMachines();
        } catch (err) { showToast(err.response?.data?.detail || 'Failed', 'error'); }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!user) { showToast('Please login first', 'error'); return; }
        try {
            await api.post(`/api/machines/${booking.id}/book`, bookForm);
            showToast(`✅ ${booking.name} booked successfully!`);
            setBooking(null); fetchMachines();
        } catch (err) { showToast(err.response?.data?.detail || 'Failed', 'error'); }
    };

    return (
        <div className="page">
            <div className="container">
                {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}

                <div className="page-header">
                    <div>
                        <h1 className="page-title">🚜 <span>Machinery Rental</span></h1>
                        <p className="page-subtitle">Rent tractors, harvesters, and equipment for your farm.</p>
                    </div>
                    {user && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ List Machine</button>}
                </div>

                {loading ? (
                    <div className="loading-overlay"><div className="spinner" /><p>Loading machines...</p></div>
                ) : machines.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🚜</div>
                        <h3>No machines available</h3>
                        <p>Be the first to list machinery for rental</p>
                    </div>
                ) : (
                    <div className="machine-grid">
                        {machines.map(m => (
                            <div className="machine-card" key={m.id}>
                                <div className="machine-icon">🚜</div>
                                <span className="badge badge-info" style={{ marginBottom: '10px' }}>{m.category || 'Machine'}</span>
                                <h3>{m.name}</h3>
                                <p>{m.description || 'Available for rent'}</p>
                                {m.location && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {m.location}</p>}
                                <div className="price-tag">
                                    <span className="price-main">₹{m.daily_rate}</span>
                                    <span className="price-unit">/day</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span className={`badge ${m.is_available ? 'badge-success' : 'badge-danger'}`}>
                                        {m.is_available ? '✅ Available' : '🚫 Rented'}
                                    </span>
                                    {m.is_available && (
                                        <button className="btn btn-primary btn-sm" onClick={() => setBooking(m)}>
                                            Book Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Machine Modal */}
                {showAdd && (
                    <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <span className="modal-title">🚜 List Your Machine</span>
                                <button className="modal-close" onClick={() => setShowAdd(false)}>×</button>
                            </div>
                            <form onSubmit={handleAdd}>
                                <div className="form-group">
                                    <label className="form-label">Machine Name *</label>
                                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g., Mahindra 575 DI Tractor" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Machine specs and condition..." />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Daily Rate (₹) *</label>
                                        <input className="form-control" type="number" value={form.daily_rate} onChange={e => setForm({ ...form, daily_rate: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input className="form-control" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Village/City" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {['Tractor', 'Harvester', 'Ploughing', 'Planting', 'Irrigation', 'Other'].map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <button className="btn btn-primary btn-full" type="submit">🚀 List Machine</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Book Machine Modal */}
                {booking && (
                    <div className="modal-overlay" onClick={() => setBooking(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <span className="modal-title">📅 Book: {booking.name}</span>
                                <button className="modal-close" onClick={() => setBooking(null)}>×</button>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                                Rate: ₹{booking.daily_rate}/day
                            </p>
                            <form onSubmit={handleBook}>
                                <div className="form-group">
                                    <label className="form-label">Start Date *</label>
                                    <input className="form-control" type="datetime-local" value={bookForm.start_date}
                                        onChange={e => setBookForm({ ...bookForm, start_date: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date *</label>
                                    <input className="form-control" type="datetime-local" value={bookForm.end_date}
                                        onChange={e => setBookForm({ ...bookForm, end_date: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <textarea className="form-control" value={bookForm.notes}
                                        onChange={e => setBookForm({ ...bookForm, notes: e.target.value })} placeholder="Any special requirements..." />
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
