import { Link } from 'react-router-dom'
import { services } from '../siteConfig'

function Services() {
  return (
    <div className="page">
      <section className="block">
        <div className="container">
          <div className="section-head">
            <h1>Our Services</h1>
            <p className="muted">
              Full-service EV care, from routine maintenance to high-voltage repairs and custom
              conversions.
            </p>
          </div>
          <div className="grid grid-3">
            {services.map((s) => (
              <div className="card" key={s.title}>
                <div className="card-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p className="muted">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 40 }}>
            <Link to="/booking" className="btn btn-primary">Book a Service</Link>
            <span style={{ display: 'inline-block', width: 12 }} />
            <Link to="/remote-programming" className="btn btn-outline">Remote Online Programming</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services
