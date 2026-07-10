import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const CATEGORIES = ['painting', 'jewelry', 'resin']
const STATUSES = ['pending_payment', 'paid', 'shipped', 'completed', 'cancelled']
const EMPTY_FORM = { name: '', category: 'painting', price: '', description: '', stock_quantity: 1 }

export default function Admin() {
  const navigate = useNavigate()
  const [session, setSession] = useState(undefined) // undefined = checking, null = logged out
  const [tab, setTab] = useState('products')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) return <div className="wrap" style={{ padding: 60 }}>Loading…</div>
  if (session === null) {
    navigate('/admin/login')
    return null
  }

  return (
    <div className="wrap" style={{ padding: '32px 28px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontStyle: 'italic' }}>Store admin</h1>
        <button className="eyebrow" onClick={() => supabase.auth.signOut()}>SIGN OUT</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <button className={tab === 'products' ? 'btn btn-dark' : 'btn btn-ghost'} onClick={() => setTab('products')}>Products</button>
        <button className={tab === 'orders' ? 'btn btn-dark' : 'btn btn-ghost'} onClick={() => setTab('orders')}>Orders</button>
      </div>

      {tab === 'products' ? <ProductsPanel /> : <OrdersPanel />}
    </div>
  )
}

function ProductsPanel() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [pendingImages, setPendingImages] = useState([])
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    const urls = []
    for (const file of files) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`
      const { error } = await supabase.storage.from('product-images').upload(path, file)
      if (error) {
        setError(`Upload failed: ${error.message}. Make sure the "product-images" storage bucket exists and is public.`)
        continue
      }
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    setPendingImages((prev) => [...prev, ...urls])
    setUploading(false)
  }

  function startEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description || '',
      stock_quantity: product.stock_quantity,
    })
    setPendingImages(product.images || [])
  }

  function resetForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setPendingImages([])
  }

  async function handleSave(e) {
    e.preventDefault()
    setError(null)
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      description: form.description,
      stock_quantity: Number(form.stock_quantity),
      images: pendingImages,
    }
    const { error } = editingId
      ? await supabase.from('products').update(payload).eq('id', editingId)
      : await supabase.from('products').insert(payload)

    if (error) { setError(error.message); return }
    resetForm()
    load()
  }

  async function toggleActive(product) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product permanently?')) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,380px) minmax(0,1fr)', gap: 40 }}>
      <form onSubmit={handleSave} style={{ background: 'var(--ink-soft)', padding: 20, borderRadius: 4, height: 'fit-content' }}>
        <h2 style={{ color: 'var(--paper)', fontSize: '1.1rem', marginBottom: 16 }}>
          {editingId ? 'Edit product' : 'Add product'}
        </h2>

        <FieldLight label="Name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        </FieldLight>

        <FieldLight label="Category">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FieldLight>

        <FieldLight label="Price (USD)">
          <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} />
        </FieldLight>

        <FieldLight label="Stock quantity">
          <input required type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} style={inputStyle} />
        </FieldLight>

        <FieldLight label="Description">
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
        </FieldLight>

        <FieldLight label="Photos">
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ color: 'var(--paper)' }} />
          {uploading && <p className="eyebrow" style={{ color: 'var(--amber)', marginTop: 6 }}>Uploading…</p>}
          {pendingImages.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {pendingImages.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                  <button
                    type="button"
                    onClick={() => setPendingImages((prev) => prev.filter((_, idx) => idx !== i))}
                    style={{ position: 'absolute', top: -6, right: -6, background: 'var(--lacquer)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 11, lineHeight: '18px' }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </FieldLight>

        {error && <p className="eyebrow" style={{ color: 'var(--lacquer)', marginTop: 10 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-primary" type="submit">{editingId ? 'Save changes' : 'Add product'}</button>
          {editingId && <button className="btn btn-ghost" type="button" onClick={resetForm} style={{ color: 'var(--paper)', borderColor: 'var(--paper)' }}>Cancel</button>}
        </div>
      </form>

      <div>
        {loading ? <p className="eyebrow">Loading…</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {products.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, border: '1px solid var(--paper-dim)', borderRadius: 4, opacity: p.is_active ? 1 : 0.5 }}>
                <div style={{ width: 48, height: 48, background: 'var(--ink-soft)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                  {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div className="eyebrow">{p.category} · ${Number(p.price).toFixed(2)} · stock {p.stock_quantity}</div>
                </div>
                <button className="eyebrow" onClick={() => startEdit(p)}>EDIT</button>
                <button className="eyebrow" onClick={() => toggleActive(p)}>{p.is_active ? 'HIDE' : 'SHOW'}</button>
                <button className="eyebrow" onClick={() => handleDelete(p.id)} style={{ color: 'var(--lacquer)' }}>DELETE</button>
              </div>
            ))}
            {products.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No products yet — add your first one.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function OrdersPanel() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id)
    load()
  }

  if (loading) return <p className="eyebrow">Loading…</p>
  if (orders.length === 0) return <p style={{ color: 'var(--text-muted)' }}>No orders yet.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {orders.map((o) => (
        <div key={o.id} style={{ border: '1px solid var(--paper-dim)', borderRadius: 4, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{o.order_number}</span>
              <span className="eyebrow" style={{ marginLeft: 12 }}>{new Date(o.created_at).toLocaleString()}</span>
            </div>
            <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '6px 10px' }}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div style={{ marginTop: 10, fontSize: '0.92rem' }}>
            <strong>{o.customer_name}</strong> · {o.customer_email} · via {o.payment_method}
          </div>
          <div className="eyebrow" style={{ marginTop: 4 }}>{o.shipping_address}</div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {o.items.map((i, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>{i.name} × {i.qty}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', marginTop: 8, fontWeight: 700 }}>
            Total ${Number(o.total).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  )
}

function FieldLight({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="eyebrow" style={{ display: 'block', marginBottom: 6, color: 'var(--paper)' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--paper-dim)',
  borderRadius: 4,
  fontSize: '0.95rem',
  fontFamily: 'var(--font-body)',
}
