import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Tractor, Wrench, Microscope, Bot, Settings, CreditCard, Leaf } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    // Nav links depending on role
    const links = [
        { to: '/marketplace', label: 'Marketplace', icon: <Store size={16} /> },
        { to: '/machinery', label: 'Machinery', icon: <Tractor size={16} /> },
        { to: '/services', label: 'Services', icon: <Wrench size={16} /> },
        { to: '/ai/disease', label: 'Disease AI', icon: <Microscope size={16} /> },
        { to: '/ai/chatbot', label: 'AgriBot', icon: <Bot size={16} /> },
        ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: <Settings size={16} /> }] : []),
        ...(user ? [{ to: '/payment', label: 'Payment', icon: <CreditCard size={16} /> }] : []),
    ];

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <Leaf color="var(--primary)" size={24} fill="var(--primary)" fillOpacity={0.2} />
                    <span>Agri<span className="brand-text">Connect</span></span>
                </Link>

                <div className="navbar-links">
                    {links.map(l => (
                        <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                            <span className="nav-icon">{l.icon}</span>
                            {l.label}
                        </NavLink>
                    ))}
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <div className="user-badge">
                            <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
                                {user.name?.split(' ')[0] || user.email}
                            </span>
                            <span className={`role-tag ${user.role}`}>{user.role}</span>
                            <button className="btn-logout" onClick={handleLogout} title="Logout">✕</button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn-nav-login">Sign In</Link>
                            <Link to="/register" className="btn-nav-cta">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
