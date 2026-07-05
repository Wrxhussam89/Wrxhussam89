import { shop } from '../siteConfig'
import logo from '../assets/logo.png'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">
            <img src={logo} alt={shop.name} className="brand-logo" />
          </div>
          <p className="muted">{shop.tagline}</p>
        </div>

        <div>
          <h3>Contact</h3>
          <p>
            <a href={shop.phoneHref}>{shop.phone}</a>
          </p>
          <p>
            <a href={shop.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
          </p>
          <p>
            <a href={`mailto:${shop.email}`}>{shop.email}</a>
          </p>
        </div>

        <div>
          <h3>Location & Hours</h3>
          <p className="muted">{shop.address}</p>
          {shop.hours.map((h) => (
            <p key={h.day}>
              <span className="muted">{h.day}:</span> {h.time}
            </p>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {shop.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
