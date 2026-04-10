import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function Payment() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const { cartItems, cartTotal, clearCart } = useCart();

    useEffect(() => {
        if (cartTotal > 0 && !amount && !description) {
            setAmount(cartTotal.toString());
            const itemsSummary = cartItems.map(i => i.name).join(', ');
            setDescription(itemsSummary.length > 50 ? itemsSummary.substring(0, 47) + '...' : itemsSummary);
        }
    }, [cartTotal, cartItems, amount, description]);

    if (!user) { navigate('/login'); return null; }

    const createOrder = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const res = await api.post('/api/payments/create-order', {
                amount: parseFloat(amount), description
            });
            setOrder(res.data);
        } catch (err) { setError(err.response?.data?.detail || 'Failed to create order'); }
        finally { setLoading(false); }
    };

    const mockVerify = async () => {
        setVerifying(true); setError('');
        try {
            const fakePaymentId = `pay_${Math.random().toString(36).substr(2, 16)}`;
            const res = await api.post('/api/payments/verify', {
                razorpay_order_id: order.razorpay_order_id,
                razorpay_payment_id: fakePaymentId,
                razorpay_signature: 'demo_signature_mock',
            });
            setResult(res.data);
            if (cartTotal > 0) clearCart();
        } catch (err) { setError(err.response?.data?.detail || 'Verification failed'); }
        finally { setVerifying(false); }
    };

    if (result) return (
        <div className="page">
            <div className="container" style={{ maxWidth: '500px' }}>
                <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
                    <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>
                        Payment Successful!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Your transaction has been completed in demo mode.
                    </p>
                    <div style={{ background: 'var(--bg-card2)', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{result.order_id}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                            <span style={{ fontWeight: 800, color: 'var(--accent)' }}>₹{result.amount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Status</span>
                            <span className="badge badge-success">Verified</span>
                        </div>
                    </div>
                    <div className="alert alert-info" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
                        🎓 This is a demo Razorpay integration. In production, connect your real Razorpay keys.
                    </div>
                    <button className="btn btn-primary" onClick={() => { setResult(null); setOrder(null); setAmount(''); setDescription(''); }}>
                        Make Another Payment
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '500px' }}>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">💳 <span>Payment</span></h1>
                        <p className="page-subtitle">Secure payment powered by Razorpay (Demo Mode)</p>
                    </div>
                </div>

                <div className="alert alert-info" style={{ marginBottom: '24px' }}>
                    🎓 <strong>Demo Mode:</strong> No real money is charged. This simulates Razorpay integration.
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {!order ? (
                    <div className="card">
                        <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>Create Payment Order</h3>
                        <form onSubmit={createOrder}>
                            <div className="form-group">
                                <label className="form-label">Amount (₹) *</label>
                                <input className="form-control" type="number" value={amount}
                                    onChange={e => setAmount(e.target.value)} required min="1"
                                    placeholder="e.g., 500" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <input className="form-control" value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="e.g., Seed purchase - Wheat 50kg" />
                            </div>
                            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                                {loading ? '⏳ Creating...' : '🛒 Create Order'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="card">
                        <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>💳 Complete Payment</h3>
                        <div style={{ background: 'var(--bg-card2)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.razorpay_order_id}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                                <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent)' }}>₹{order.amount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                                <span className="badge badge-warning">pending</span>
                            </div>
                        </div>

                        <div style={{ border: '2px dashed var(--border-light)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💳</div>
                            <div style={{ fontWeight: 700, marginBottom: '6px' }}>Razorpay Payment Gateway</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                In production: This opens the Razorpay payment modal
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '1.5rem' }}>
                                {['💳', '📱', '🏦', '🎫'].map(i => <span key={i}>{i}</span>)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                Cards • UPI • Net Banking • Wallets
                            </div>
                        </div>

                        <button className="btn btn-primary btn-full" onClick={mockVerify} disabled={verifying}>
                            {verifying ? '⏳ Processing...' : '✅ Simulate Successful Payment'}
                        </button>
                        <button className="btn btn-secondary btn-full" style={{ marginTop: '8px' }} onClick={() => setOrder(null)}>
                            ← Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
