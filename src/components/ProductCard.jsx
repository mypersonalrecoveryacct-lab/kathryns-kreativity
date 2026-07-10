import { Link } from 'react-router-dom'

const CATEGORY_LABEL = { painting: 'PT', jewelry: 'JW', resin: 'RS' }

export default function ProductCard({ product }) {
  const soldOut = product.stock_quantity <= 0
  return (
    <Link
      to={`/product/${product.id}`}
      style={{ display: 'block', textDecoration: 'none' }}
    >
      <div
        style={{
          background: 'var(--ink-soft)',
          aspectRatio: '1 / 1',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: 12,
        }}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: soldOut ? 0.4 : 1 }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }} className="eyebrow">
            no image yet
          </div>
        )}
        <span className={`seal ${product.category}`} style={{ position: 'absolute', top: 12, left: 12, width: 34, height: 34, fontSize: '0.6rem' }}>
          {CATEGORY_LABEL[product.category]}
        </span>
        {soldOut && (
          <span
            className="eyebrow"
            style={{ position: 'absolute', bottom: 12, left: 12, background: 'var(--ink)', color: 'var(--paper)', padding: '4px 10px', borderRadius: 2 }}
          >
            Sold out
          </span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500 }}>{product.name}</h3>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
          ${Number(product.price).toFixed(2)}
        </span>
      </div>
    </Link>
  )
}
