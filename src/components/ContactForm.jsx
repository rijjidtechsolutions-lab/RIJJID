import { useState } from 'react'
import { services } from '../data'

export default function ContactForm() {
  const [state, setState] = useState({ type: 'idle', message: 'Your inquiry will be delivered directly to RIJJID.' })
  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setState({ type: 'sending', message: 'Sending your inquiry...' })
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to send your inquiry.')
      form.reset()
      setState({ type: 'success', message: 'Thank you. Your inquiry has been sent to RIJJID.' })
    } catch (error) {
      setState({ type: 'error', message: error.message || 'Unable to send your inquiry. Please try again.' })
    }
  }
  return <form className="brief-form reveal" onSubmit={submit}>
    <label>Your name or company<input required name="name" autoComplete="name" maxLength="120" placeholder="Name or company" /></label>
    <label>Email address<input required type="email" name="email" autoComplete="email" maxLength="254" placeholder="you@example.com" /></label>
    <label>Service needed<select name="service">{services.map((service) => <option key={service.number}>{service.title}</option>)}<option>Not sure yet</option></select></label>
    <label>Project summary<textarea required name="summary" maxLength="4000" rows="4" placeholder="What would you like help with?" /></label>
    <label className="form-trap" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label>
    <button className="button button-primary" type="submit" disabled={state.type === 'sending'}>{state.type === 'sending' ? 'Sending...' : 'Send project inquiry'} <span>↗</span></button>
    <p className={`form-note ${state.type}`} role="status" aria-live="polite">{state.message}</p>
  </form>
}
