import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQty, removeItem, subtotal } = useCart()
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}
    >
      <div
        onClick={() => setIsOpen(false)}
        style={{ position: 'absolute', inset: 0, background: 'rgba(30,24,38,0.5)' }}
      />
      <div
        style={{
          position: 'relative',
          width: 'min(420px, 100vw)',
          height: '100%',
          background: 'var(--paper)',
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.3rem', fontStyle: 'italic' }}>Your cart</h2>
          <button className="eyebrow" onClick={() => setIsOpen(false)}>CLOSE</button>
        </div>

        {items.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nothing in your cart yet. Go find something you love.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
            {items.map((item) => (
              <div key={item.product_id} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 64, height: 64, background: 'var(--ink-soft)', borderRadius: 4, flexShrink: 0, overflow: 'hidden' }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <select
                      className="eyebrow"
                      value={item.qty}
                      onChange={(e) => updateQty(item.product_id, Number(e.target.value))}
                      style={{ border: '1px solid var(--paper-dim)', borderRadius: 4, padding: '4px 8px' }}
                    >
                      {Array.from({ length: Math.max(item.maxQty ?? 1, item.qty) }, (_, n) => n + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <button className="eyebrow" onClick={() => removeItem(item.product_id)} style={{ color: 'var(--lacquer)' }}>
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div style={{ borderTop: '1px solid var(--paper-dim)', paddingTop: 18, marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                setIsOpen(false)
                navigate('/checkout')
              }}
            >
              Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
