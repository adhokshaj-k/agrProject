import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const QUICK_QUESTIONS = [
    '🌿 Yellow leaves on wheat', '🐛 Pest infestation help',
    '🍄 Fungal disease treatment', '🌾 Best crop for this season',
    '💧 Irrigation advice', '💰 Mandi prices today',
    '🌱 Fertilizer recommendation', '🪱 Soil health tips',
];

function formatTime(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function Chatbot() {
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: '🙏 **Namaste! Welcome to AgriConnect AI**\n\nI\'m your intelligent farming assistant. Ask me about:\n• Crop diseases and treatments\n• Pest management\n• Irrigation advice\n• Market prices\n• Seasonal crop recommendations\n\nHow can I help you today?',
            time: new Date().toISOString(),
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: msg, time: new Date().toISOString() }]);
        setLoading(true);
        try {
            const res = await api.post('/api/ai/chat', { message: msg });
            setMessages(prev => [...prev, { role: 'bot', text: res.data.response, time: res.data.timestamp || new Date().toISOString() }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Connection error. Please check your internet and try again.', time: new Date().toISOString() }]);
        } finally { setLoading(false); }
    };

    const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

    // Simple markdown bold conversion
    const renderText = (text) => {
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div style={{ paddingTop: 'calc(var(--nav-height))', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', padding: '16px', height: '100%', overflow: 'hidden' }}>

                {/* Sidebar */}
                <div className="chat-sidebar">
                    <div style={{ fontWeight: 700, marginBottom: '16px', fontSize: '1rem' }}>🤖 AgriBot</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
                        AI-powered farming assistant available 24/7 for crop advice, disease info, and more.
                    </p>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                        Quick Questions:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {QUICK_QUESTIONS.map(q => (
                            <button key={q}
                                style={{
                                    background: 'var(--bg-card2)', border: '1px solid var(--border)',
                                    borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
                                    textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)',
                                    transition: 'all 0.2s',
                                }}
                                onClick={() => sendMessage(q.replace(/^[^\s]+\s/, ''))}
                                onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
                                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
                            >{q}</button>
                        ))}
                    </div>
                    <div style={{ marginTop: '24px', padding: '12px', background: 'var(--bg-card2)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            💡 Tip: Ask about specific symptoms for accurate advice. E.g., "my tomato leaves have yellow patches"
                        </p>
                    </div>
                </div>

                {/* Chat Main */}
                <div className="chat-main">
                    <div className="chat-header">
                        <div className="bot-avatar">🌾</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>AgriConnect AI</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                                Online & Ready
                            </div>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`message ${m.role}`}>
                                {m.role === 'bot' && <div className="bot-avatar" style={{ width: 32, height: 32, fontSize: '0.9rem', flexShrink: 0 }}>🌾</div>}
                                <div>
                                    <div className="message-bubble">{renderText(m.text)}</div>
                                    <div className="message-time">{formatTime(m.time)}</div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message bot">
                                <div className="bot-avatar" style={{ width: 32, height: 32, fontSize: '0.9rem', flexShrink: 0 }}>🌾</div>
                                <div className="message-bubble" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    {[0, 1, 2].map(i => (
                                        <span key={i} style={{
                                            width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
                                            animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
                                            display: 'inline-block',
                                        }} />
                                    ))}
                                    <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }`}</style>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="chat-input-row">
                        <textarea
                            className="chat-input"
                            placeholder="Ask about crops, diseases, weather, prices..."
                            value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey} rows={1}
                        />
                        <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
