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
              Need ECU, module, or key programming done remotely? Submit your vehicle details
              below and one of our technicians will schedule a remote programming session with
              you.
            </p>
          </div>

          <div className="notice" style={{ maxWidth: 640, margin: '0 auto 24px' }}>
            <strong>How this works:</strong> all remote programming requests are handled through
            this form only - we do not offer support over WhatsApp or other messaging apps.
            Please provide accurate contact and vehicle information, including your VIN, so we
            can prepare the correct programming files before contacting you.
          </div>

          <ServiceRequestForm type="remote-programming" requireVin showPreferredDate={false} />
        </div>
      </section>
    </div>
  )
}

export default RemoteProgramming
