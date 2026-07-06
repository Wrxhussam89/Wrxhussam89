import ServiceRequestForm from '../components/ServiceRequestForm'
import { shop } from '../siteConfig'

function Booking() {
  return (
    <div className="page">
      <section className="block">
        <div className="container">
          <div className="section-head">
            <h1>Bring your EV in, or ask us first</h1>
            <p className="muted">
              Call, WhatsApp, or fill in the form below - whichever's easiest. Pickup and
              delivery available across Amman.
            </p>
          </div>

          <div className="grid grid-2" style={{ marginBottom: 48, alignItems: 'start' }}>
            <div className="grid" style={{ gap: 16 }}>
              <div className="card">
                <h3>📍 Address</h3>
                <p className="muted">{shop.address}</p>
              </div>
              <div className="card">
                <h3>📞 Phone</h3>
                <p><a href={shop.phoneHref}>{shop.phone}</a></p>
              </div>
              <div className="card">
                <h3>💬 WhatsApp</h3>
                <p><a href={shop.whatsapp} target="_blank" rel="noreferrer">Chat with us directly</a></p>
              </div>
              <div className="card">
                <h3>🕒 Hours</h3>
                {shop.hours.map((h) => (
                  <p key={h.day} className="muted" style={{ marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-h)', fontWeight: 600 }}>{h.day}:</span> {h.time}
                  </p>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', minHeight: 320 }}>
              <iframe
                src={shop.mapEmbedUrl}
                title="Shop location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ width: '100%', height: '100%', minHeight: 320, border: 0 }}
              />
            </div>
          </div>

          <div className="section-head">
            <h2>Book a Service</h2>
            <p className="muted">
              Tell us about your vehicle and what it needs - we'll confirm your appointment by
              phone or email.
            </p>
          </div>
          <ServiceRequestForm type="booking" showPreferredDate requireVin={false} />
        </div>
      </section>
    </div>
  )
}

export default Booking
