import ServiceRequestForm from '../components/ServiceRequestForm'
import { useT } from '../i18n'

function RemoteProgramming() {
  const { t } = useT()

  return (
    <div className="page">
      <section className="block">
        <div className="container">
          <div className="section-head">
            <span className="badge">{t('remote.badge')}</span>
            <h1>{t('remote.heading')}</h1>
            <p className="muted">
              {t('remote.sub')}
            </p>
          </div>

          <div className="notice" style={{ maxWidth: 640, margin: '0 auto 24px' }}>
            <strong>{t('remote.howItWorks')}</strong> {t('remote.howItWorksBody')}
          </div>

          <ServiceRequestForm type="remote-programming" requireVin showPreferredDate={false} />
        </div>
      </section>
    </div>
  )
}

export default RemoteProgramming
