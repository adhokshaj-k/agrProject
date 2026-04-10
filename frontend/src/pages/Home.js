import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Store, Tractor, Wrench, Microscope, Bot, CreditCard, Sparkles } from 'lucide-react';

const FEATURES = [
    { icon: <Store size={36} strokeWidth={1.5} color="var(--primary)" />, title: 'Marketplace', desc: 'Buy & sell seeds, fertilizers, and equipment from verified sellers.', to: '/marketplace' },
    { icon: <Tractor size={36} strokeWidth={1.5} color="var(--primary)" />, title: 'Machinery Rental', desc: 'Rent tractors, harvesters, and farm equipment by the day.', to: '/machinery' },
    { icon: <Wrench size={36} strokeWidth={1.5} color="var(--primary)" />, title: 'Service Booking', desc: 'Book soil testing, drone spraying, and ploughing services.', to: '/services' },
    { icon: <Microscope size={36} strokeWidth={1.5} color="var(--primary)" />, title: 'Disease Detection', desc: 'Upload a plant photo and get instant AI disease diagnosis.', to: '/ai/disease' },
    { icon: <Bot size={36} strokeWidth={1.5} color="var(--primary)" />, title: 'AI Farm Assistant', desc: 'Chat with AgriBot for crop advice, mandi prices, and more.', to: '/ai/chatbot' },
    { icon: <CreditCard size={36} strokeWidth={1.5} color="var(--primary)" />, title: 'Secure Payments', desc: 'Pay securely via Razorpay — cards, UPI, and net banking.', to: '/payment' },
];

const STATS = [
    { value: '10,000+', label: 'Farmers' },
    { value: '500+', label: 'Products' },
    { value: '200+', label: 'Machines' },
    { value: '50+', label: 'Services' },
];

export default function Home() {
    const { user } = useAuth();

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            {/* Hero */}
            <div className="hero">
                <div className="container">
                    <motion.div className="hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                        <div className="hero-tag">
                            <Sparkles size={16} /> Powered by AI
                        </div>
                        <h1>
                            Smart Farming for<br />
                            <span className="highlight">Modern India</span>
                        </h1>
                        <p>
                            AgriConnect AI connects farmers, sellers, and service providers
                            with AI-powered tools for disease detection, smart advice, and
                            seamless market access.
                        </p>
                        <div className="hero-actions">
                            {user ? (
                                <Link to="/marketplace" className="btn btn-primary">Browse Marketplace →</Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary">Get Started Free →</Link>
                                    <Link to="/ai/chatbot" className="btn btn-secondary">Try AI Assistant</Link>
                                </>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-image"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
                    >
                        <img src="/assets/images/hero.png" alt="Modern Farmer with Tablet" />
                    </motion.div>
                </div>
            </div>

            {/* Stats */}
            <motion.div
                className="stats-bar"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                {STATS.map(s => (
                    <div className="stat-item" key={s.label}>
                        <span className="stat-value">{s.value}</span>
                        <span className="stat-label">{s.label}</span>
                    </div>
                ))}
            </motion.div>

            {/* Features */}
            <div className="section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5 }}
                        style={{ display: "flex", alignItems: "flex-end", gap: "20px", justifyContent: "space-between", flexWrap: "wrap" }}
                    >
                        <div>
                            <h2>Everything you need to farm smarter</h2>
                            <p>All agricultural tools in one place — no downloads required.</p>
                        </div>
                        <img src="/assets/images/tractor.png" alt="Tractor" style={{ height: "60px", opacity: 0.8 }} />
                    </motion.div>
                    <div className="feature-grid">
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                            >
                                <Link to={f.to} className="feature-card">
                                    <span className="feature-icon">{f.icon}</span>
                                    <h3>{f.title}</h3>
                                    <p>{f.desc}</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            {!user && (
                <div style={{ background: 'var(--primary-bg)', borderTop: '1px solid var(--border)', padding: '48px 0' }}>
                    <div className="container" style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '10px' }}>
                            Ready to transform your farming?
                        </h2>
                        <p style={{ color: 'var(--gray-500)', marginBottom: '24px', fontSize: '0.9rem' }}>
                            Join thousands of farmers already using AgriConnect AI.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <Link to="/register" className="btn btn-primary">Create Free Account</Link>
                            <Link to="/login" className="btn btn-secondary">Sign In</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
