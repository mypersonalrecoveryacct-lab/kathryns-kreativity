import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabaseClient'

// Update these with your real handles/links before launch
const PAYMENT_OPTIONS = [
  { key: 'venmo', label: 'Venmo', detail: '@your-venmo-handle' },
  { key: 'cashapp', label: 'Cash App', detail: '$your-cashtag' },
  { key: 'zelle', label: 'Zelle', detail: 'your-email-or-phone' },
  { key: 'paypal', label: 'PayPal', detail: 'paypal.me/yourlink' },
]

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', address: '' })
  const [paymentMethod, setPaymentMethod] = useState('venmo')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (items.length === 0) {
    return (
      <div className="wrap" style={{ padding: '60px 28px' }}>
        <p>Your cart is empty.</p>
        <Link className="btn btn-ghost" to="/shop" style={{ marginTop: 16 }}>← Back to shop</Link>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data, error } = await supabase.rpc('place_order', {
      p_customer_name: form.name,
      p_customer_email: form.email,
      p_shipping_address: form.address,
      p_items: items.map((i) => ({ product_id: i.product_id, qty: i.qty })),
      p_payment_method: paymentMethod,
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
      return
    }

    clearCart()
    navigate('/order-confirmation', { state: { order: data, paymentMethod } })
  }

  return (
    <div className="wrap" style={{ padding: '40px 28px 80px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: 48 }}>
      <form onSubmit={handleSubmit}>
        <h1 style={{ fontSize: '1.8rem', fontStyle: 'italic', marginBottom: 24 }}>Checkout</h1>

        <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Full name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
        />

        <label className="eyebrow" style={{ display: 'block', margin: '18px 0 6px' }}>Email</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={inputStyle}
        />

        <label className="eyebrow" style={{ display: 'block', margin: '18px 0 6px' }}>Shipping address</label>
        <textarea
          required
          rows={3}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        <label className="eyebrow" style={{ display: 'block', margin: '24px 0 10px' }}>Pay with</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PAYMENT_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                border: paymentMethod === opt.key ? '1px solid var(--ink)' : '1px solid var(--paper-dim)',
                borderRadius: 4, cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="payment"
                value={opt.key}
                checked={paymentMethod === opt.key}
                onChange={() => setPaymentMethod(opt.key)}
              />
              <span style={{ fontWeight: 500 }}>{opt.label}</span>
              <span className="eyebrow" style={{ marginLeft: 'auto' }}>{opt.detail}</span>
            </label>
          ))}
        </div>

        {error && (
          <p className="eyebrow" style={{ color: 'var(--lacquer)', marginTop: 16 }}>{error}</p>
        )}

        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ marginTop: 28 }}>
          {submitting ? 'Placing order…' : `Place order — $${subtotal.toFixed(2)}`}
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 12 }}>
          Your order is reserved now. You'll get exact payment instructions and your
          order number on the next screen — send payment there to confirm.
        </p>
      </form>

      <aside style={{ background: 'var(--ink-soft)', borderRadius: 4, padding: 24, height: 'fit-content' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--paper)', marginBottom: 16 }}>Order summary</h2>
        {items.map((i) => (
          <div key={i.product_id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--paper)', marginBottom: 8, fontSize: '0.9rem' }}>
            <span>{i.name} × {i.qty}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>${(i.price * i.qty).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid rgba(243,236,226,0.2)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </aside>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid var(--paper-dim)',
  borderRadius: 4,
  fontFamily: 'var(--font-body)',
  fontSize: '1rem',
  background: 'white',
}
