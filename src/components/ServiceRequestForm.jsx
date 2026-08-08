import { useState } from 'react'
import { submitServiceRequest, isDemoMode } from '../api/client'
import { carBrands } from '../carBrands'
import { useT } from '../i18n'

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

function ServiceRequestForm({ type, requireVin = false, showPreferredDate = false }) {
  const [values, setValues] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const { t } = useT()

  const selectedBrand = carBrands.find((b) => b.name === values.carMake)
  const modelOptions = selectedBrand?.models || []

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  function handleBrandChange(e) {
    setValues((v) => ({ ...v, carMake: e.target.value, carModel: '' }))
  }

  function validate() {
    const next = {}
    if (!values.name.trim()) next.name = t('form.errName')
    if (!values.phone.trim()) next.phone = t('form.errPhone')
    if (!values.email.trim()) next.email = t('form.errEmail')
    else if (!emailPattern.test(values.email.trim())) next.email = t('form.errEmailInvalid')
    if (!values.carMake) next.carMake = t('form.errBrand')
    if (!values.carModel.trim()) next.carModel = t('form.errModel')
    if (requireVin) {
      if (!values.vin.trim()) next.vin = t('form.errVin')
      else if (!vinPattern.test(values.vin.trim())) next.vin = t('form.errVinInvalid')
    } else if (values.vin.trim() && !vinPattern.test(values.vin.trim())) {
      next.vin = t('form.errVinInvalid')
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
      setSubmitError(err.message || t('form.errSubmit'))
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="form-card form-success">
        <h2>{t('form.successHeading')}</h2>
        <p className="muted">
          {t('form.successBody', {
            name: values.name.split(' ')[0] || '',
            email: values.email,
            phone: values.phone,
          })}
        </p>
        {isDemoMode && (
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            {t('form.demoSuccessNote')}
          </p>
        )}
      </div>
    )
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {isDemoMode && (
        <div className="notice">
          <strong>{t('common.demoMode')}</strong> {t('form.demoNotice', { code: 'VITE_API_BASE_URL' })}
        </div>
      )}

      <div className="form-row">
        <label htmlFor="name">{t('form.fullName')}</label>
        <input id="name" type="text" value={values.name} onChange={(e) => update('name', e.target.value)} />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className="form-row-2">
        <div className="form-row">
          <label htmlFor="phone">{t('form.phone')}</label>
          <input id="phone" type="tel" value={values.phone} onChange={(e) => update('phone', e.target.value)} />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>
        <div className="form-row">
          <label htmlFor="email">{t('form.email')}</label>
          <input id="email" type="email" value={values.email} onChange={(e) => update('email', e.target.value)} />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
      </div>

      <div className="form-row-2">
        <div className="form-row">
          <label htmlFor="carMake">{t('form.carBrand')}</label>
          <select id="carMake" value={values.carMake} onChange={handleBrandChange}>
            <option value="">{t('form.selectBrand')}</option>
            {carBrands.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
          </select>
          {errors.carMake && <div className="form-error">{errors.carMake}</div>}
        </div>
        <div className="form-row">
          <label htmlFor="carModel">{t('form.carModel')}</label>
          {values.carMake === 'Other' || modelOptions.length === 0 ? (
            <input
              id="carModel"
              type="text"
              placeholder={t('form.enterModel')}
              value={values.carModel}
              onChange={(e) => update('carModel', e.target.value)}
            />
          ) : (
            <select id="carModel" value={values.carModel} onChange={(e) => update('carModel', e.target.value)}>
              <option value="">{t('form.selectModel')}</option>
              {modelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              <option value="__other">{t('form.otherModel')}</option>
            </select>
          )}
          {values.carModel === '__other' && (
            <input
              type="text"
              placeholder={t('form.enterModelName')}
              style={{ marginTop: 8 }}
              onChange={(e) => update('carModel', e.target.value || '__other')}
            />
          )}
          {errors.carModel && <div className="form-error">{errors.carModel}</div>}
        </div>
      </div>

      <div className="form-row-2">
        <div className="form-row">
          <label htmlFor="carYear">{t('form.carYear')}</label>
          <input id="carYear" type="text" placeholder={t('form.yearPlaceholder')} value={values.carYear} onChange={(e) => update('carYear', e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="vin">{requireVin ? t('form.vin') : t('form.vinOptional')}</label>
          <input
            id="vin"
            type="text"
            maxLength={17}
            placeholder={t('form.vinPlaceholder')}
            value={values.vin}
            onChange={(e) => update('vin', e.target.value.toUpperCase())}
          />
          {errors.vin && <div className="form-error">{errors.vin}</div>}
        </div>
      </div>

      {showPreferredDate && (
        <div className="form-row">
          <label htmlFor="preferredDate">{t('form.preferredDate')}</label>
          <input id="preferredDate" type="date" value={values.preferredDate} onChange={(e) => update('preferredDate', e.target.value)} />
        </div>
      )}

      <div className="form-row">
        <label htmlFor="notes">{t('form.notes')}</label>
        <textarea id="notes" value={values.notes} onChange={(e) => update('notes', e.target.value)} />
      </div>

      {submitError && <div className="form-error">{submitError}</div>}

      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
        {submitting ? t('form.submitting') : t('form.submitRequest')}
      </button>
    </form>
  )
}

export default ServiceRequestForm
