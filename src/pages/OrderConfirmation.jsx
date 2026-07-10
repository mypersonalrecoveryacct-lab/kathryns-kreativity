import { useLocation, Link, Navigate } from 'react-router-dom'

const PAYMENT_LABELS = {
  venmo: { label: 'Venmo', detail: '@your-venmo-handle' },
  cashapp: { label: 'Cash App', detail: '$your-cashtag' },
  zelle: { label: 'Zelle', detail: 'your-email-or-phone' },
  paypal: { label: 'PayPal', detail: 'paypal.me/yourlink' },
}

export default function OrderConfirmation() {
  const { state } = useLocation()
  if (!state?.order) return <Navigate to="/shop" replace />

  const { order, paymentMethod } = state
  const payment = PAYMENT_LABELS[paymentMethod]

  return (
    <div className="wrap" style={{ padding: '60px 28px 100px', maxWidth: 640 }}>
      <span className="eyebrow">Order {order.order_number}</span>
      <h1 style={{ fontSize: '2rem', fontStyle: 'italic', marginTop: 10 }}>
        Thank you — your piece is reserved.
      </h1>
      <p style={{ marginTop: 16, color: '#4A3F52' }}>
        Send <strong>${Number(order.total).toFixed(2)}</strong> via <strong>{payment.label}</strong> to{' '}
        <strong>{payment.detail}</strong>, and include your order number{' '}
        <strong>{order.order_number}</strong> in the note. Once payment is received,
        your order will be marked paid and shipped within a few days.
      </p>

      <div style={{ background: 'var(--ink-soft)', color: 'var(--paper)', borderRadius: 4, padding: 24, marginTop: 28 }}>
        <h2 style={{ fontSize: '1rem', marginBottom: 14 }}>What you ordered</h2>
        {order.items.map((i) => (
          <div key={i.product_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem' }}>
            <span>{i.name} × {i.qty}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>${(i.price * i.qty).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid rgba(243,236,226,0.2)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <Link className="btn btn-ghost" to="/shop" style={{ marginTop: 32 }}>← Continue shopping</Link>
    </div>
  )
}
