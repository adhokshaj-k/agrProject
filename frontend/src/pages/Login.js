import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(form.email, form.password);
            if (data.user.role === 'admin') navigate('/admin');
            else navigate('/marketplace');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">🌾</div>
                    <h2>Welcome Back</h2>
                    <p>Sign in to your AgriConnect account</p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                    <strong>Demo Admin:</strong> admin@agriconnect.com / admin123
                </div>

                <form onSubmit={submit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-control" type="email" name="email"
                            placeholder="you@example.com" value={form.email} onChange={handle} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-control" type="password" name="password"
                            placeholder="Your password" value={form.password} onChange={handle} required />
                    </div>
                    <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                        {loading ? '⏳ Signing in...' : '🔐 Sign In'}
                    </button>
                </form>

                <div className="auth-link-row">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}
