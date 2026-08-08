import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { shop } from '../siteConfig'
import { useT } from '../i18n'
import logo from '../assets/logo.png'

function Navbar() {
  const [open, setOpen] = useState(false)
  const { t, lang, setLang } = useT()

  const links = [
    { to: '/', label: t('nav.home'), primary: true },
    { to: '/services', label: t('nav.services'), primary: true },
    { to: '/remote-programming', label: t('nav.remoteProgramming'), primary: true },
    { to: '/about', label: t('nav.about') },
    { to: '/booking', label: t('nav.bookService'), primary: true },
    { to: '/portal', label: t('nav.customerPortal'), primary: true },
  ]

  function toggleLang() {
    setLang(lang === 'en' ? 'ar' : 'en')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <img src={logo} alt={shop.name} className="brand-logo" />
        </NavLink>

        <button
          className="nav-toggle"
          aria-label={t('nav.toggleNav')}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `${isActive ? 'active' : ''}${link.primary ? ' nav-link-primary' : ''}`
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="nav-links-mobile-actions">
            <button className="btn btn-outline lang-toggle" onClick={toggleLang}>{t('nav.langToggle')}</button>
            <a href={shop.phoneHref} className="btn btn-outline">{t('nav.callNow')}</a>
            <a href={shop.whatsapp} target="_blank" rel="noreferrer" className="btn btn-primary">{t('nav.whatsapp')}</a>
          </div>
        </nav>

        <div className="header-actions">
          <button className="btn btn-outline lang-toggle" onClick={toggleLang}>{t('nav.langToggle')}</button>
          <Link to="/portal" className="btn btn-outline">{t('nav.account')}</Link>
          <a href={shop.phoneHref} className="btn btn-outline">{t('nav.callNow')}</a>
          <a href={shop.whatsapp} target="_blank" rel="noreferrer" className="btn btn-primary">{t('nav.whatsapp')}</a>
        </div>
      </div>
    </header>
  )
}

export default Navbar
