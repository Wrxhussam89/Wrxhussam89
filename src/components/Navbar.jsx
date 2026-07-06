import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { shop } from '../siteConfig'
import logo from '../assets/logo.png'

const links = [
  { to: '/', label: 'Home', primary: true },
  { to: '/services', label: 'Services', primary: true },
  { to: '/remote-programming', label: 'Remote Programming', primary: true },
  { to: '/about', label: 'About' },
  { to: '/booking', label: 'Book a Service', primary: true },
  { to: '/portal', label: 'Customer Portal', primary: true },
]

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <img src={logo} alt={shop.name} className="brand-logo" />
        </NavLink>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
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
            <a href={shop.phoneHref} className="btn btn-outline">Call Now</a>
            <a href={shop.whatsapp} target="_blank" rel="noreferrer" className="btn btn-primary">WhatsApp</a>
          </div>
        </nav>

        <div className="header-actions">
          <Link to="/portal" className="btn btn-outline">Account</Link>
          <a href={shop.phoneHref} className="btn btn-outline">Call Now</a>
          <a href={shop.whatsapp} target="_blank" rel="noreferrer" className="btn btn-primary">WhatsApp</a>
        </div>
      </div>
    </header>
  )
}

export default Navbar
