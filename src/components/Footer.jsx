import { shop } from '../siteConfig'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="brand footer-brand">
            <span className="brand-bolt">⚡</span>
            <span>{shop.name}</span>
          </div>
          <p className="muted">{shop.tagline}</p>
        </div>

        <div>
          <h3>Contact</h3>
          <p>
            <a href={shop.phoneHref}>{shop.phone}</a>
          </p>
          <p>
            <a href={`mailto:${shop.email}`}>{shop.email}</a>
          </p>
          <p>{shop.address}</p>
        </div>

        <div>
          <h3>Hours</h3>
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
