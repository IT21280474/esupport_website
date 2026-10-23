import { useCallback, useState } from 'react'
import { ApiError } from '../lib/api'

/**
 * Form state with client-side validation, server (422) error mapping and
 * idle / submitting / success / error status.
 *
 * @param {object} initial          initial values
 * @param {(values) => object} validate   returns { field: message }
 * @param {(values, form: HTMLFormElement) => Promise<{message?: string}>} onSubmit
 */
export function useForm({ initial, validate = () => ({}), onSubmit }) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  /** Stable setter for programmatic updates (e.g. pre-filling from the URL). */
  const setValue = useCallback((name, value) => setValues((current) => ({ ...current, [name]: value })), [])

  const bind = (name) => ({
    name,
    value: values[name] ?? '',
    onChange: (event) => {
      const next = { ...values, [name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }
      setValues(next)
      // Re-validate as the user types once the field has shown an error
      if (errors[name]) setErrors((e) => ({ ...e, [name]: validate(next)[name] }))
    },
    onBlur: () => setErrors((e) => ({ ...e, [name]: validate(values)[name] })),
    'aria-invalid': errors[name] ? 'true' : undefined,
  })

  const focusFirstError = (form, fieldErrors) => {
    const first = Object.keys(fieldErrors).find((key) => fieldErrors[key])
    if (first) form?.querySelector(`[name="${first}"]`)?.focus()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const clientErrors = Object.fromEntries(Object.entries(validate(values)).filter(([, v]) => v))
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) {
      focusFirstError(form, clientErrors)
      return
    }

    setStatus({ state: 'submitting', message: '' })
    try {
      const result = await onSubmit(values, form)
      setStatus({ state: 'success', message: result?.message || 'Thank you — your message has been sent.' })
      setValues(initial)
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const serverErrors = Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, v[0]]))
        setErrors(serverErrors)
        focusFirstError(form, serverErrors)
      }
      setStatus({ state: 'error', message: error.message })
    }
  }

  return { values, setValue, errors, bind, status, handleSubmit }
}

/** Common validators returning an error message or undefined. */
export const rules = {
  required: (value, message = 'This field is required.') => (String(value ?? '').trim() ? undefined : message),
  email: (value) => (!value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'Please enter a valid email address.'),
  phone: (value) => (!value || /^[0-9+\s\-()]{9,20}$/.test(value) ? undefined : 'Please enter a valid phone number.'),
  minLength: (value, length) => (!value || String(value).trim().length >= length ? undefined : 'Please add a little more detail.'),
}
