import { useState, useRef, useCallback } from 'react';
import api from '../services/api';

export default function DiseaseDetection() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);
    const fileRef = useRef();

    const handleFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('File too large. Max 5MB.'); return; }
        setError('');
        setImage(file);
        setResult(null);
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault(); setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    }, []);

    const handleAnalyze = async () => {
        if (!image) { setError('Please upload an image first.'); return; }
        setLoading(true); setError(''); setResult(null);
        const formData = new FormData();
        formData.append('file', image);
        try {
            const res = await api.post('/api/ai/disease-detect', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Analysis failed. Try again.');
        } finally { setLoading(false); }
    };

    const healthyColor = result?.disease_name === 'Healthy' ? 'var(--accent)' : 'var(--warning)';
    const confPct = result ? Math.round(result.confidence * 100) : 0;

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">🔬 <span>Disease Detection</span></h1>
                        <p className="page-subtitle">Upload a plant leaf image to get AI-powered disease analysis.</p>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="alert alert-info" style={{ marginBottom: '24px' }}>
                    🤖 <strong>AI Analysis:</strong> Our model detects Leaf Blight, Powdery Mildew, Rust, Early Blight, Bacterial Spot, and healthy plants.
                </div>

                {/* Upload Zone */}
                <div
                    className={`upload-zone ${dragging ? 'dragging' : ''}`}
                    onClick={() => fileRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    {preview ? (
                        <img src={preview} alt="Uploaded leaf"
                            style={{ maxHeight: '220px', borderRadius: '12px', margin: '0 auto' }} />
                    ) : (
                        <>
                            <div className="upload-icon">🌿</div>
                            <h3>Drop your plant image here</h3>
                            <p>or click to browse — JPG, PNG, WEBP (max 5MB)</p>
                        </>
                    )}
                    <input type="file" ref={fileRef} accept="image/*" hidden
                        onChange={e => handleFile(e.target.files[0])} />
                </div>

                {error && <div className="alert alert-error" style={{ marginTop: '16px' }}>⚠️ {error}</div>}

                {image && !loading && (
                    <button className="btn btn-primary btn-full" style={{ marginTop: '16px' }}
                        onClick={handleAnalyze}>
                        🔍 Analyze Disease
                    </button>
                )}

                {loading && (
                    <div className="loading-overlay" style={{ marginTop: '16px' }}>
                        <div className="spinner" />
                        <p>Analyzing your plant image with AI...</p>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="disease-result">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>DETECTED DISEASE</p>
                                <div className="disease-name" style={{ color: healthyColor }}>
                                    {result.disease_name === 'Healthy' ? '✅' : '⚠️'} {result.disease_name}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>CONFIDENCE</p>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: healthyColor }}>{confPct}%</div>
                            </div>
                        </div>

                        <div className="confidence-bar">
                            <div className="confidence-fill" style={{
                                width: `${confPct}%`,
                                background: result.disease_name === 'Healthy'
                                    ? 'linear-gradient(90deg, var(--green-500), var(--green-400))'
                                    : 'linear-gradient(90deg, var(--warning), #fbbf24)'
                            }} />
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <p style={{ fontWeight: 600, marginBottom: '10px', fontSize: '0.95rem' }}>
                                💊 Treatment Recommendation
                            </p>
                            <div className="treatment-box">{result.treatment}</div>
                        </div>

                        <button className="btn btn-secondary" style={{ marginTop: '16px' }}
                            onClick={() => { setResult(null); setImage(null); setPreview(null); }}>
                            🔄 Analyze Another Image
                        </button>
                    </div>
                )}

                {/* How It Works */}
                <div className="card" style={{ marginTop: '40px' }}>
                    <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>🤖 How It Works</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', textAlign: 'center' }}>
                        {[
                            { icon: '📸', step: '1. Upload', desc: 'Take a clear photo of the infected leaf' },
                            { icon: '🧠', step: '2. AI Analyzes', desc: 'Our model processes and classifies the disease' },
                            { icon: '💊', step: '3. Get Treatment', desc: 'Receive specific treatment recommendations' },
                        ].map(s => (
                            <div key={s.step} style={{ padding: '16px', background: 'var(--bg-dark)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</div>
                                <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '0.9rem' }}>{s.step}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
