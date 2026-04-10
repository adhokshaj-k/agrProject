import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORY_ICONS = {
    Seeds: '🌱', Fertilizers: '⚗️', Pesticides: '🧪',
    Tools: '🔧', Equipment: '⚙️', Other: '📦',
};

function ProductCard({ product, onBook }) {
    const icon = CATEGORY_ICONS[product.category] || '📦';
    return (
        <div className="product-card">
            <div className="product-image">{icon}</div>
            <div className="product-body">
                <span className="badge badge-info" style={{ marginBottom: '8px' }}>{product.category}</span>
                <h3>{product.name}</h3>
                <p className="product-desc">{product.description || 'No description available.'}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Stock: <strong style={{ color: 'var(--text-secondary)' }}>{product.stock}</strong> units
                </div>
            </div>
            <div className="product-footer">
                <span className="product-price">₹{product.price.toFixed(2)}</span>
                <button className="btn btn-primary btn-sm" onClick={() => onBook(product)}>
                    Buy Now
                </button>
            </div>
        </div>
    );
}

export default function Marketplace() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: 'Seeds', image_url: '' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (category) params.category = category;
            const res = await api.get('/api/products/', { params });
            setProducts(res.data);
        } catch { showToast('Failed to load products', 'error'); }
        finally { setLoading(false); }
    }, [search, category]);

    useEffect(() => {
        fetchProducts();
        api.get('/api/products/categories/list').then(r => setCategories(r.data)).catch(() => { });
    }, [fetchProducts]);

    const handleBuy = (product) => {
        if (!user) { showToast('Please login to buy', 'error'); return; }
        showToast(`🛒 ${product.name} added to cart! Proceed to payment.`);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/products/', { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) });
            showToast('✅ Product listed successfully!');
            setShowAdd(false);
            setForm({ name: '', description: '', price: '', stock: '', category: 'Seeds', image_url: '' });
            fetchProducts();
        } catch (err) { showToast(err.response?.data?.detail || 'Failed to add product', 'error'); }
    };

    return (
        <div className="page">
            <div className="container">
                {toast && (
                    <div className="toast-container">
                        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
                    </div>
                )}

                <div className="page-header">
                    <div>
                        <h1 className="page-title">🛒 <span>Marketplace</span></h1>
                        <p className="page-subtitle">Buy seeds, fertilizers, equipment, and more directly from sellers.</p>
                    </div>
                    {(user?.role === 'seller' || user?.role === 'admin') && (
                        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Product</button>
                    )}
                </div>

                {/* Search */}
                <div className="search-bar">
                    <input className="search-input" placeholder="🔍 Search products..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="form-control" style={{ maxWidth: '200px' }}
                        value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        {['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Equipment', 'Other'].map(c =>
                            !categories.includes(c) ? <option key={c} value={c}>{c}</option> : null
                        )}
                    </select>
                    <button className="btn btn-secondary" onClick={fetchProducts}>Search</button>
                </div>

                {/* Products */}
                {loading ? (
                    <div className="loading-overlay"><div className="spinner" /><p>Loading products...</p></div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🌾</div>
                        <h3>No products found</h3>
                        <p>Try a different search term or category</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map(p => <ProductCard key={p.id} product={p} onBook={handleBuy} />)}
                    </div>
                )}

                {/* Add Product Modal */}
                {showAdd && (
                    <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <span className="modal-title">📦 Add New Product</span>
                                <button className="modal-close" onClick={() => setShowAdd(false)}>×</button>
                            </div>
                            <form onSubmit={handleAdd}>
                                <div className="form-group">
                                    <label className="form-label">Product Name *</label>
                                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g., Hybrid Tomato Seeds" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product details..." />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Price (₹) *</label>
                                        <input className="form-control" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="0" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock *</label>
                                        <input className="form-control" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required min="0" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Equipment', 'Other'].map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <button className="btn btn-primary btn-full" type="submit">🚀 List Product</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
