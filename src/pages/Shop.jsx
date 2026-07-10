import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard'

const CATEGORIES = [
  { key: 'painting', label: 'Paintings' },
  { key: 'jewelry', label: 'Jewelry' },
  { key: 'resin', label: 'Resin Crafts' },
]

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (error) setError(error.message)
      else setProducts(data ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products
    return products.filter((p) => p.category === activeCategory)
  }, [products, activeCategory])

  return (
    <div>
      {/* Hero */}
      <section className="wrap" style={{ padding: '64px 28px 40px' }}>
        <span className="eyebrow">Original work · Made by hand · Los Angeles</span>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontStyle: 'italic', marginTop: 12, maxWidth: 760 }}>
          Paint, patina, and poured resin — kept a little imperfect on purpose.
        </h1>
        <p style={{ maxWidth: 560, marginTop: 20, color: '#4A3F52' }}>
          Every painting, pendant, and resin piece here started as one idea and stayed
          one of a kind. Browse the shop below, or shop by category.
        </p>
      </section>

      {/* Category filter */}
      <div className="wrap" style={{ display: 'flex', gap: 10, padding: '0 28px 32px', flexWrap: 'wrap' }}>
        <button
          className={activeCategory === 'all' ? 'btn btn-dark' : 'btn btn-ghost'}
          onClick={() => setSearchParams({})}
        >
          All work
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={activeCategory === c.key ? 'btn btn-dark' : 'btn btn-ghost'}
            onClick={() => setSearchParams({ category: c.key })}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <section className="wrap" style={{ padding: '0 28px 80px' }}>
        {loading && <p className="eyebrow">Loading the shop…</p>}
        {error && (
          <p className="eyebrow" style={{ color: 'var(--lacquer)' }}>
            Couldn't load products: {error}. Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
          </p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>
            Nothing here yet — new pieces are added regularly, check back soon.
          </p>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 28,
          }}
        >
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
