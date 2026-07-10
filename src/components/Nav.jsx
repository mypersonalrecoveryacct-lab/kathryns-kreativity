import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Nav() {
  const { itemCount, setIsOpen } = useCart()

  return (
    <header style={{ borderBottom: '1px solid var(--paper-dim)', position: 'sticky', top: 0, background: 'var(--paper)', zIndex: 20 }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.4rem', fontWeight: 600 }}>
          Kathryn's Kreativity
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link className="eyebrow" to="/shop?category=painting">Paintings</Link>
          <Link className="eyebrow" to="/shop?category=jewelry">Jewelry</Link>
          <Link className="eyebrow" to="/shop?category=resin">Resin</Link>
          <button
            className="eyebrow"
            onClick={() => setIsOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-on-paper)' }}
            aria-label="Open cart"
          >
            CART {itemCount > 0 && <span style={{ background: 'var(--amber)', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>{itemCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  )
}
