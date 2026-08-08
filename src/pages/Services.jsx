import { Link } from 'react-router-dom'
import { services } from '../siteConfig'
import { useT } from '../i18n'

function Services() {
  const { t } = useT()

  return (
    <div className="page">
      <section className="block">
        <div className="container">
          <div className="section-head">
            <h1>{t('services.heading')}</h1>
            <p className="muted">
              {t('services.sub')}
            </p>
          </div>
          <div className="grid grid-3">
            {services.map((s, i) => (
              <div className="card" key={s.title}>
                <div className="card-icon">{s.icon}</div>
                <h3>{t(`site.service.${i}.title`)}</h3>
                <p className="muted">{t(`site.service.${i}.desc`)}</p>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 40 }}>
            <Link to="/booking" className="btn btn-primary">{t('home.bookService')}</Link>
            <span style={{ display: 'inline-block', width: 12 }} />
            <Link to="/remote-programming" className="btn btn-outline">{t('home.remoteOnline')}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services
