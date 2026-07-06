import ServiceRequestForm from '../components/ServiceRequestForm'

function RemoteProgramming() {
  return (
    <div className="page">
      <section className="block">
        <div className="container">
          <div className="section-head">
            <span className="badge">Remote Service</span>
            <h1>Remote Online Programming</h1>
            <p className="muted">
              Submit your vehicle details and we'll schedule a remote ECU, module, or key
              programming session with you.
            </p>
          </div>

          <div className="notice" style={{ maxWidth: 640, margin: '0 auto 24px' }}>
            <strong>How this works:</strong> form-only intake — we don't offer WhatsApp support
            for remote programming. Include an accurate VIN so we can prepare the right files
            before we contact you.
          </div>

          <ServiceRequestForm type="remote-programming" requireVin showPreferredDate={false} />
        </div>
      </section>
    </div>
  )
}

export default RemoteProgramming
