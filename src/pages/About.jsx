import { shop } from '../siteConfig'
import { useT } from '../i18n'
import logo from '../assets/logo.png'

function About() {
  const { t } = useT()

  const values = [
    { title: t('about.value1Title'), desc: t('about.value1Desc') },
    { title: t('about.value2Title'), desc: t('about.value2Desc') },
    { title: t('about.value3Title'), desc: t('about.value3Desc') },
    { title: t('about.value4Title'), desc: t('about.value4Desc') },
  ]

  return (
    <div className="page">
      <section className="block">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t('about.storyEyebrow')}</span>
            <h1>{t('about.storyHeading')}</h1>
            <p className="muted">
              {t('about.storyBody', { shopName: shop.name })}
            </p>
          </div>

          <div className="grid grid-2" style={{ alignItems: 'center', marginBottom: 48 }}>
            <div className="text-center">
              <img src={logo} alt={shop.name} style={{ maxWidth: '60%', height: 'auto' }} />
            </div>
            <div>
              <span className="eyebrow">{t('about.missionEyebrow')}</span>
              <h2>{t('about.missionHeading')}</h2>
              <p className="muted">
                {t('about.missionBody1', { shopName: shop.name })}
              </p>
              <p className="muted">
                {t('about.missionBody2')}
              </p>
            </div>
          </div>

          <div className="section-head">
            <span className="eyebrow">{t('about.valuesEyebrow')}</span>
            <h2>{t('about.valuesHeading')}</h2>
          </div>
          <div className="grid grid-2">
            {values.map((v) => (
              <div className="card" key={v.title}>
                <h3>{v.title}</h3>
                <p className="muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
