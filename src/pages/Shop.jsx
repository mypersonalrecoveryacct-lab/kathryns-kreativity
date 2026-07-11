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
    {/* Past work — not for sale, just a look at earlier pieces */}
      <section className="wrap" style={{ padding: '20px 28px 70px' }}>
        <span className="eyebrow">A look back</span>
        <h2 style={{ fontSize: '1.6rem', fontStyle: 'italic', marginTop: 8, marginBottom: 4 }}>
          A few earlier pieces
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Not for sale — just a glimpse of where this all started.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {[
            { src: 'https://raw.githubusercontent.com/mypersonalrecoveryacct-lab/kathryns-kreativity/main/necklace.jpg', caption: 'Garnet bead necklace & earring set' },
            { src: 'https://raw.githubusercontent.com/mypersonalrecoveryacct-lab/kathryns-kreativity/main/umbrella-painting.jpg', caption: 'Umbrella in the rain, acrylic' },
            { src: 'https://raw.githubusercontent.com/mypersonalrecoveryacct-lab/kathryns-kreativity/main/dandelion-painting.jpg', caption: 'Dandelions, acrylic' },
            { src: 'https://raw.githubusercontent.com/mypersonalrecoveryacct-lab/kathryns-kreativity/main/mad-hatter-box.jpg', caption: 'Mad Hatter trinket box, mixed media' },
          ].map((item) => (
            <div key={item.caption}>
              <div style={{ aspectRatio: '1/1', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                <img src={item.src} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p className="eyebrow" style={{ color: 'var(--text-muted)' }}>{item.caption}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '64px 28px', marginBottom: -80 }}>
        <div className="wrap" style={{ maxWidth: 640 }}>
          <blockquote style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.4rem', lineHeight: 1.4 }}>
            "And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him."
          </blockquote>
          <span className="eyebrow" style={{ display: 'block', marginTop: 10, color: 'var(--amber)' }}>— Colossians 3:17</span>
          <p style={{ marginTop: 24, color: '#D9CFE0' }}>
            Creativity is a gift, not something I earned — and every piece here is my
            way of giving thanks for it. From hand-strung beadwork to layered paint to
            one-of-a-kind mixed media, each piece starts as an idea and stays exactly
            that: one of a kind. Based in Los Angeles County.
          </p>
        </div>
      </section>
    </div>
  )
}
