import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar() {
    const { isCartOpen, setIsCartOpen, cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/payment');
    };

    return (
        <>
            <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}></div>
            <div className="cart-sidebar">
                <div className="cart-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingCart size={20} className="text-primary" />
                        <h3>Your Cart</h3>
                    </div>
                    <button className="cart-close" onClick={() => setIsCartOpen(false)}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className="cart-content">
                    {cartItems.length === 0 ? (
                        <div className="cart-empty">
                            <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-info">
                                    <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{item.name}</h4>
                                    <div className="cart-item-price">₹{item.price.toFixed(2)}</div>
                                </div>
                                <div className="cart-item-actions">
                                    <div className="qty-controls">
                                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={12} /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={12} /></button>
                                    </div>
                                    <button className="btn-remove" onClick={() => removeFromCart(item.id)}>Remove</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <strong>₹{cartTotal.toFixed(2)}</strong>
                        </div>
                        <button className="btn btn-primary btn-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={handleCheckout}>
                            Checkout <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
