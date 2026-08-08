import ServiceRequestForm from '../components/ServiceRequestForm'
import { shop } from '../siteConfig'
import { useT } from '../i18n'

function Booking() {
  const { t } = useT()

  return (
    <div className="page">
      <section className="block">
        <div className="container">
          <div className="section-head">
            <h1>{t('booking.heading')}</h1>
            <p className="muted">
              {t('booking.sub')}
            </p>
          </div>

          <div className="grid grid-2" style={{ marginBottom: 48, alignItems: 'start' }}>
            <div className="grid" style={{ gap: 16 }}>
              <div className="card">
                <h3>{'\u{1F4CD}'} {t('booking.address')}</h3>
                <p className="muted">{t('site.address')}</p>
              </div>
              <div className="card">
                <h3>{'\u{1F4DE}'} {t('booking.phone')}</h3>
                <p><a href={shop.phoneHref}>{shop.phone}</a></p>
              </div>
              <div className="card">
                <h3>{'\u{1F4AC}'} {t('booking.whatsapp')}</h3>
                <p><a href={shop.whatsapp} target="_blank" rel="noreferrer">{t('booking.chatDirectly')}</a></p>
              </div>
              <div className="card">
                <h3>{'\u{1F552}'} {t('booking.hours')}</h3>
                {shop.hours.map((h) => (
                  <p key={h.day} className="muted" style={{ marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-h)', fontWeight: 600 }}>{t(`site.day.${h.day}`)}:</span>{' '}
                    {h.time === 'Closed' ? t('site.time.closed') : h.time}
                  </p>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', minHeight: 320 }}>
              <iframe
                src={shop.mapEmbedUrl}
                title={t('booking.mapTitle')}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ width: '100%', height: '100%', minHeight: 320, border: 0 }}
              />
            </div>
          </div>

          <div className="section-head">
            <h2>{t('booking.formHeading')}</h2>
            <p className="muted">
              {t('booking.formSub')}
            </p>
          </div>
          <ServiceRequestForm type="booking" showPreferredDate requireVin={false} />
        </div>
      </section>
    </div>
  )
}

export default Booking
