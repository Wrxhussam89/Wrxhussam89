import { shop } from '../siteConfig'
import logo from '../assets/logo.png'

const values = [
  {
    title: 'Safety first, always',
    desc: 'High-voltage systems demand respect - every technician is trained in EV-specific safety procedures before touching a battery pack.',
  },
  {
    title: 'Diagnose before we touch anything',
    desc: 'We use OEM-grade diagnostic tools to confirm the actual fault, rather than swapping parts and hoping.',
  },
  {
    title: 'Straight answers',
    desc: "You'll know what's wrong, what it costs, and why - before any work begins.",
  },
  {
    title: 'Your time matters',
    desc: 'Pickup and delivery across Amman means keeping your car in our shop, not you in our waiting room.',
  },
]

function About() {
  return (
    <div className="page">
      <section className="block">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our story</span>
            <h1>Built for Jordan's electric shift</h1>
            <p className="muted">
              As EVs became a real part of daily driving in Amman, we saw the gap: garages built
              around combustion engines, adapting as they went. {shop.name} exists to close that
              gap - a workshop built around electric vehicles from day one.
            </p>
          </div>

          <div className="grid grid-2" style={{ alignItems: 'center', marginBottom: 48 }}>
            <div className="text-center">
              <img src={logo} alt={shop.name} style={{ maxWidth: '60%', height: 'auto' }} />
            </div>
            <div>
              <span className="eyebrow">Our mission</span>
              <h2>Keep Jordan's EVs running with confidence</h2>
              <p className="muted">
                We started {shop.name} to give EV owners in Amman a place that understands their
                car properly - high-voltage safety, battery chemistry, and the software that runs
                underneath it all. No guesswork, no combustion-era habits applied where they
                don't belong.
              </p>
              <p className="muted">
                Every job that comes through our Bayader Industrial Area workshop is handled by
                technicians trained specifically for electric drivetrains, with diagnostic tools
                built for the job.
              </p>
            </div>
          </div>

          <div className="section-head">
            <span className="eyebrow">What we stand for</span>
            <h2>The principles behind every job</h2>
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
