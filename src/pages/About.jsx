import { shop } from '../siteConfig'

function About() {
  return (
    <div className="page">
      <section className="block">
        <div className="container">
          <div className="section-head">
            <h1>About {shop.name}</h1>
            <p className="muted">
              We're an independent workshop focused entirely on electric vehicles - no gas
              engines, no guesswork, just technicians who know EVs inside and out.
            </p>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3>Why Choose Us</h3>
              <p className="muted">
                Every technician on our floor is trained specifically on high-voltage systems,
                battery packs, and EV drivetrains. We invest in manufacturer-grade diagnostic
                tools so your vehicle is diagnosed correctly the first time.
              </p>
            </div>
            <div className="card">
              <h3>Our Hours</h3>
              {shop.hours.map((h) => (
                <p key={h.day} className="muted">
                  <strong style={{ color: 'var(--text-h)' }}>{h.day}:</strong> {h.time}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
