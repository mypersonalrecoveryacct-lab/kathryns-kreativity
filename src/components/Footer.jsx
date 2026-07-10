export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--paper-dim)', marginTop: 80 }}>
      <div className="wrap" style={{ padding: '32px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span className="eyebrow">© {new Date().getFullYear()} Kathryn's Kreativity — made by hand, shipped with care</span>
        <span className="eyebrow">Questions? hello@kathrynskreativity.com (update with your store contact email)</span>
      </div>
    </footer>
  )
}
