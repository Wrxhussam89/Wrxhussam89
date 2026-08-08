import { Link } from 'react-router-dom'
import { shop, services } from '../siteConfig'
import { useT } from '../i18n'

function Home() {
  const { t } = useT()

  return (
    <div className="page">
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">{t('home.eyebrow')}</span>
            <h1>{t('site.tagline')}</h1>
            <p className="muted">
              {t('home.heroDesc', { shopName: shop.name })}
            </p>
            <div className="hero-actions">
              <Link to="/booking" className="btn btn-primary">{t('home.bookService')}</Link>
              <Link to="/remote-programming" className="btn btn-outline">{t('home.remoteOnline')}</Link>
            </div>
          </div>
          <div className="hero-panel">
            <h3>{t('home.visitContact')}</h3>
            <ul>
              <li>
                <strong>{'\u{1F4CD}'}</strong>
                <span>{t('site.address')}</span>
              </li>
              <li>
                <strong>{'\u{1F4DE}'}</strong>
                <a href={shop.phoneHref}>{shop.phone}</a>
              </li>
              <li>
                <strong>{'\u{1F4AC}'}</strong>
                <a href={shop.whatsapp} target="_blank" rel="noreferrer">{t('common.whatsapp')}</a>
              </li>
              <li>
                <strong>{'✉️'}</strong>
                <a href={`mailto:${shop.email}`}>{shop.email}</a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head">
            <h2>{t('home.whatWeDo')}</h2>
            <p className="muted">{t('home.whatWeDoSub')}</p>
          </div>
          <div className="grid grid-3">
            {services.slice(0, 6).map((s, i) => (
              <div className="card" key={s.title}>
                <div className="card-icon">{s.icon}</div>
                <h3>{t(`site.service.${i}.title`)}</h3>
                <p className="muted">{t(`site.service.${i}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h2 style={{ marginBottom: 4 }}>{t('home.ctaHeading')}</h2>
              <p className="muted" style={{ marginBottom: 0 }}>{t('home.ctaDesc')}</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/booking" className="btn btn-primary">{t('home.bookService')}</Link>
              <Link to="/portal" className="btn btn-outline">{t('home.customerPortal')}</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
