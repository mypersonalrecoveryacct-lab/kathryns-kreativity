import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../context/CartContext'

const CATEGORY_LABEL = { painting: 'Painting', jewelry: 'Jewelry', resin: 'Resin craft' }

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      if (!cancelled) {
        setProduct(data)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) return <div className="wrap" style={{ padding: '60px 28px' }}><p className="eyebrow">Loading…</p></div>
  if (!product) {
    return (
      <div className="wrap" style={{ padding: '60px 28px' }}>
        <p>That piece isn't available anymore.</p>
        <Link className="btn btn-ghost" to="/shop" style={{ marginTop: 16 }}>← Back to shop</Link>
      </div>
    )
  }

  const soldOut = product.stock_quantity <= 0
  const images = product.images?.length ? product.images : [null]

  return (
    <div className="wrap" style={{ padding: '40px 28px 80px', display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)', gap: 48 }}>
      <div>
        <div style={{ aspectRatio: '1/1', background: 'var(--ink-soft)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          {images[activeImage] ? (
            <img src={images[activeImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="eyebrow" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>no image yet</div>
          )}
        </div>
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 8 }}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                style={{
                  width: 60, height: 60, borderRadius: 4, overflow: 'hidden', flexShrink: 0,
                  border: i === activeImage ? '2px solid var(--amber)' : '1px solid var(--paper-dim)',
                }}
              >
                {img && <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <span className={`seal ${product.category}`} style={{ marginBottom: 16 }}>
          {CATEGORY_LABEL[product.category]?.slice(0, 2).toUpperCase()}
        </span>
        <span className="eyebrow" style={{ display: 'block', marginTop: 12 }}>{CATEGORY_LABEL[product.category]}</span>
        <h1 style={{ fontSize: '2rem', fontStyle: 'italic', marginTop: 8 }}>{product.name}</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', marginTop: 12 }}>${Number(product.price).toFixed(2)}</p>
        <p style={{ marginTop: 20, color: '#4A3F52', whiteSpace: 'pre-wrap' }}>{product.description}</p>

        <div style={{ marginTop: 28 }}>
          {soldOut ? (
            <button className="btn btn-ghost" disabled>Sold out</button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => {
                addItem(product, 1)
                setAdded(true)
                setTimeout(() => setAdded(false), 1800)
              }}
            >
              {added ? 'Added ✓' : 'Add to cart'}
            </button>
          )}
          {!soldOut && product.stock_quantity <= 3 && (
            <p className="eyebrow" style={{ marginTop: 10, color: 'var(--lacquer)' }}>
              Only {product.stock_quantity} left — one of a kind, once it's gone it's gone.
            </p>
          )}
        </div>

        <Link className="eyebrow" to="/shop" style={{ display: 'inline-block', marginTop: 32 }}>← Back to shop</Link>
      </div>
    </div>
  )
}
