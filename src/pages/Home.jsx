import { Link } from 'react-router-dom'
import { shop, services } from '../siteConfig'

function Home() {
  return (
    <div className="page">
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Amman's EV Specialists</span>
            <h1>{shop.tagline}</h1>
            <p className="muted">
              From battery diagnostics to charging system repair, {shop.name} keeps your
              electric vehicle running at its best - in the shop or fully remote.
            </p>
            <div className="hero-actions">
              <Link to="/booking" className="btn btn-primary">Book a Service</Link>
              <Link to="/remote-programming" className="btn btn-outline">Remote Online Programming</Link>
            </div>
          </div>
          <div className="hero-panel">
            <h3>Visit or Contact Us</h3>
            <ul>
              <li>
                <strong>📍</strong>
                <span>{shop.address}</span>
              </li>
              <li>
                <strong>📞</strong>
                <a href={shop.phoneHref}>{shop.phone}</a>
              </li>
              <li>
                <strong>💬</strong>
                <a href={shop.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
              </li>
              <li>
                <strong>✉️</strong>
                <a href={`mailto:${shop.email}`}>{shop.email}</a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head">
            <h2>What We Do</h2>
            <p className="muted">Certified, EV-only technicians using manufacturer-grade diagnostic tools.</p>
          </div>
          <div className="grid grid-3">
            {services.slice(0, 6).map((s) => (
              <div className="card" key={s.title}>
                <div className="card-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p className="muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h2 style={{ marginBottom: 4 }}>Ready to get your EV serviced?</h2>
              <p className="muted" style={{ marginBottom: 0 }}>Book an in-shop appointment or submit a remote programming request online.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/booking" className="btn btn-primary">Book a Service</Link>
              <Link to="/portal" className="btn btn-outline">Customer Portal</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
