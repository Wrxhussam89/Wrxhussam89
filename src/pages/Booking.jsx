import ServiceRequestForm from '../components/ServiceRequestForm'
import { shop } from '../siteConfig'

function Booking() {
  return (
    <div className="page">
      <section className="block">
        <div className="container">
          <div className="section-head">
            <h1>Book a Service</h1>
            <p className="muted">
              Tell us about your vehicle and what it needs. We'll contact you at{' '}
              <a href={shop.phoneHref}>{shop.phone}</a> or by email to confirm your appointment.
            </p>
          </div>
          <ServiceRequestForm type="booking" showPreferredDate requireVin={false} />
        </div>
      </section>
    </div>
  )
}

export default Booking
