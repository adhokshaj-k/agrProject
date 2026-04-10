import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'farmer' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">🌱</div>
                    <h2>Create Account</h2>
                    <p>Join thousands of farmers on AgriConnect</p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={submit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-control" name="name" placeholder="Rajan Sharma"
                            value={form.name} onChange={handle} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-control" type="email" name="email"
                            placeholder="rajan@example.com" value={form.email} onChange={handle} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input className="form-control" name="phone" placeholder="+91 98765 43210"
                            value={form.phone} onChange={handle} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-control" type="password" name="password"
                            placeholder="Min 6 characters" value={form.password} onChange={handle} required minLength="6" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">I am a...</label>
                        <select className="form-control" name="role" value={form.role} onChange={handle}>
                            <option value="farmer">🌾 Farmer – Buy products & book services</option>
                            <option value="seller">🏪 Seller – List products & services</option>
                        </select>
                    </div>

                    {form.role === 'seller' && (
                        <div className="alert alert-info">
                            ℹ️ Seller accounts require admin approval before listing products.
                        </div>
                    )}

                    <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                        {loading ? '⏳ Creating account...' : '🚀 Create Account'}
                    </button>
                </form>

                <div className="auth-link-row">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
