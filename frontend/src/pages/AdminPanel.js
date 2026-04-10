import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/'); return; }
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [s, u, t] = await Promise.all([
                api.get('/api/admin/stats'),
                api.get('/api/admin/users'),
                api.get('/api/admin/transactions'),
            ]);
            setStats(s.data); setUsers(u.data); setTransactions(t.data);
        } catch { showToast('Failed to load data', 'error'); }
        finally { setLoading(false); }
    };

    const approveUser = async (id, name) => {
        try {
            await api.patch(`/api/admin/users/${id}/approve`);
            showToast(`✅ ${name} approved!`); fetchAll();
        } catch { showToast('Failed to approve', 'error'); }
    };

    const deactivateUser = async (id, name) => {
        if (!window.confirm(`Deactivate ${name}?`)) return;
        try {
            await api.patch(`/api/admin/users/${id}/deactivate`);
            showToast(`User ${name} deactivated`); fetchAll();
        } catch { showToast('Failed', 'error'); }
    };

    if (loading) return <div className="page"><div className="loading-overlay"><div className="spinner" /></div></div>;

    const STAT_CARDS = stats ? [
        { icon: '👥', num: stats.total_users, label: 'Total Users' },
        { icon: '🌾', num: stats.total_farmers, label: 'Farmers' },
        { icon: '🏪', num: stats.total_sellers, label: 'Sellers' },
        { icon: '📦', num: stats.total_products, label: 'Products' },
        { icon: '🚜', num: stats.total_machines, label: 'Machines' },
        { icon: '💳', num: stats.total_payments, label: 'Transactions' },
        { icon: '⏳', num: stats.pending_approvals, label: 'Pending Approvals', highlight: stats.pending_approvals > 0 },
    ] : [];

    return (
        <div className="page">
            <div className="container">
                {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}

                <div className="page-header">
                    <div>
                        <h1 className="page-title">⚙️ <span>Admin Panel</span></h1>
                        <p className="page-subtitle">Manage users, approve sellers, and view transactions.</p>
                    </div>
                    <button className="btn btn-secondary" onClick={fetchAll}>🔄 Refresh</button>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {['stats', 'users', 'transactions'].map(t => (
                        <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {t === 'stats' ? '📊 Dashboard' : t === 'users' ? '👥 Users' : '💳 Transactions'}
                        </button>
                    ))}
                </div>

                {/* Dashboard Stats */}
                {tab === 'stats' && (
                    <>
                        <div className="admin-grid">
                            {STAT_CARDS.map(c => (
                                <div className="stat-card" key={c.label} style={c.highlight ? { borderColor: 'rgba(245,158,11,0.4)' } : {}}>
                                    <div className="stat-icon">{c.icon}</div>
                                    <div className="stat-num" style={c.highlight ? { color: 'var(--warning)' } : {}}>{c.num}</div>
                                    <div className="stat-name">{c.label}</div>
                                </div>
                            ))}
                        </div>
                        {stats?.pending_approvals > 0 && (
                            <div className="alert alert-info">
                                ⚠️ You have <strong>{stats.pending_approvals}</strong> sellers waiting for approval.
                                <button className="btn btn-sm" style={{ marginLeft: '12px' }} onClick={() => setTab('users')}>
                                    Review Now →
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Users Table */}
                {tab === 'users' && (
                    <div className="card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>#{u.id}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td><span className={`role-tag ${u.role}`}>{u.role}</span></td>
                                        <td>
                                            <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {u.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            {u.role === 'seller' && !u.is_approved && (
                                                <span className="badge badge-warning" style={{ marginLeft: '4px' }}>Pending</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {u.role === 'seller' && !u.is_approved && (
                                                    <button className="btn btn-sm btn-primary" onClick={() => approveUser(u.id, u.name)}>
                                                        Approve
                                                    </button>
                                                )}
                                                {u.role !== 'admin' && u.is_active && (
                                                    <button className="btn btn-sm btn-danger" onClick={() => deactivateUser(u.id, u.name)}>
                                                        Deactivate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Transactions Table */}
                {tab === 'transactions' && (
                    <div className="card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>User ID</th><th>Order ID</th><th>Amount</th><th>Status</th><th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No transactions yet</td></tr>
                                ) : transactions.map(t => (
                                    <tr key={t.id}>
                                        <td>#{t.id}</td>
                                        <td>#{t.user_id}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{t.razorpay_order_id || 'N/A'}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{t.amount}</td>
                                        <td>
                                            <span className={`badge ${t.status === 'success' ? 'badge-success' : t.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN') : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
