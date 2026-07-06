import { useState } from 'react'
import { submitServiceRequest, isDemoMode } from '../api/client'
import { carBrands } from '../carBrands'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/i

const initialState = {
  name: '',
  phone: '',
  email: '',
  carMake: '',
  carModel: '',
  carYear: '',
  vin: '',
  preferredDate: '',
  notes: '',
}

function BrandPicker({ selected, onSelect }) {
  return (
    <div className="brand-picker">
      <label>Select Your Car Brand</label>
      <div className="brand-grid">
        {carBrands.map((brand) => (
          <button
            key={brand.name}
            type="button"
            className={`brand-card${selected === brand.name ? ' active' : ''}`}
            onClick={() => onSelect(brand.name)}
          >
            <span
              className="brand-card-logo"
              dangerouslySetInnerHTML={{ __html: brand.svg }}
            />
            <span className="brand-card-name">{brand.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ServiceRequestForm({ type, requireVin = false, showPreferredDate = false }) {
  const [values, setValues] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const selectedBrand = carBrands.find((b) => b.name === values.carMake)
  const modelOptions = selectedBrand?.models || []

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  function handleBrandSelect(brandName) {
    setValues((v) => ({ ...v, carMake: brandName, carModel: '' }))
  }

  function validate() {
    const next = {}
    if (!values.name.trim()) next.name = 'Full name is required.'
    if (!values.phone.trim()) next.phone = 'Phone number is required.'
    if (!values.email.trim()) next.email = 'Email address is required.'
    else if (!emailPattern.test(values.email.trim())) next.email = 'Enter a valid email address.'
    if (!values.carMake) next.carMake = 'Please select a car brand.'
    if (!values.carModel.trim()) next.carModel = 'Car model is required.'
    if (requireVin) {
      if (!values.vin.trim()) next.vin = 'VIN is required.'
      else if (!vinPattern.test(values.vin.trim())) next.vin = 'Enter a valid 17-character VIN.'
    } else if (values.vin.trim() && !vinPattern.test(values.vin.trim())) {
      next.vin = 'Enter a valid 17-character VIN.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      const record = await submitServiceRequest({ type, ...values })
      setResult(record)
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong submitting your request.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="form-card form-success">
        <h2>Request Received</h2>
        <p className="muted">
          Thanks, {values.name.split(' ')[0] || 'there'}! Your request has been submitted.
          We'll reach out at <strong>{values.email}</strong> or <strong>{values.phone}</strong>{' '}
          to confirm next steps.
        </p>
        {isDemoMode && (
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            (Demo mode: this request was saved locally in your browser. Connect the site to your
            backend/ERP API to store real submissions.)
          </p>
        )}
      </div>
    )
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {isDemoMode && (
        <div className="notice">
          <strong>Demo mode:</strong> no backend is connected yet, so submissions are stored only
          in your browser. Set <code>VITE_API_BASE_URL</code> to wire this up to your ERP.
        </div>
      )}

      <div className="form-row">
        <label htmlFor="name">Full Name</label>
        <input id="name" type="text" value={values.name} onChange={(e) => update('name', e.target.value)} />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className="form-row-2">
        <div className="form-row">
          <label htmlFor="phone">Phone Number</label>
          <input id="phone" type="tel" value={values.phone} onChange={(e) => update('phone', e.target.value)} />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>
        <div className="form-row">
          <label htmlFor="email">Email Address</label>
          <input id="email" type="email" value={values.email} onChange={(e) => update('email', e.target.value)} />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
      </div>

      <BrandPicker selected={values.carMake} onSelect={handleBrandSelect} />
      {errors.carMake && <div className="form-error" style={{ marginTop: 4 }}>{errors.carMake}</div>}

      <div className="form-row-2" style={{ marginTop: 18 }}>
        <div className="form-row">
          <label htmlFor="carModel">Car Model</label>
          {values.carMake === 'Other' || modelOptions.length === 0 ? (
            <input
              id="carModel"
              type="text"
              placeholder="Enter your car model"
              value={values.carModel}
              onChange={(e) => update('carModel', e.target.value)}
            />
          ) : (
            <select id="carModel" value={values.carModel} onChange={(e) => update('carModel', e.target.value)}>
              <option value="">Select model...</option>
              {modelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              <option value="__other">Other model</option>
            </select>
          )}
          {values.carModel === '__other' && (
            <input
              type="text"
              placeholder="Enter model name"
              style={{ marginTop: 8 }}
              onChange={(e) => update('carModel', e.target.value || '__other')}
            />
          )}
          {errors.carModel && <div className="form-error">{errors.carModel}</div>}
        </div>
        <div className="form-row">
          <label htmlFor="carYear">Car Year</label>
          <input id="carYear" type="text" placeholder="e.g. 2022" value={values.carYear} onChange={(e) => update('carYear', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="vin">VIN (Vehicle Identification Number){requireVin ? '' : ' - optional'}</label>
        <input
          id="vin"
          type="text"
          maxLength={17}
          placeholder="17-character VIN"
          value={values.vin}
          onChange={(e) => update('vin', e.target.value.toUpperCase())}
        />
        {errors.vin && <div className="form-error">{errors.vin}</div>}
      </div>

      {showPreferredDate && (
        <div className="form-row">
          <label htmlFor="preferredDate">Preferred Date</label>
          <input id="preferredDate" type="date" value={values.preferredDate} onChange={(e) => update('preferredDate', e.target.value)} />
        </div>
      )}

      <div className="form-row">
        <label htmlFor="notes">Describe the Issue / What You Need</label>
        <textarea id="notes" value={values.notes} onChange={(e) => update('notes', e.target.value)} />
      </div>

      {submitError && <div className="form-error">{submitError}</div>}

      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
        {submitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}

export default ServiceRequestForm
