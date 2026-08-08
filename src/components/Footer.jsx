import { shop } from '../siteConfig'
import { useT } from '../i18n'
import logo from '../assets/logo.png'

function Footer() {
  const { t } = useT()

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">
            <img src={logo} alt={shop.name} className="brand-logo" />
          </div>
          <p className="muted">{t('site.tagline')}</p>
        </div>

        <div>
          <h3>{t('footer.contact')}</h3>
          <p>
            <a href={shop.phoneHref}>{shop.phone}</a>
          </p>
          <p>
            <a href={shop.whatsapp} target="_blank" rel="noreferrer">{t('common.whatsapp')}</a>
          </p>
          <p>
            <a href={`mailto:${shop.email}`}>{shop.email}</a>
          </p>
        </div>

        <div>
          <h3>{t('footer.locationHours')}</h3>
          <p className="muted">{t('site.address')}</p>
          {shop.hours.map((h) => (
            <p key={h.day}>
              <span className="muted">{t(`site.day.${h.day}`)}:</span>{' '}
              {h.time === 'Closed' ? t('site.time.closed') : h.time}
            </p>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {shop.name}. {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}

export default Footer
