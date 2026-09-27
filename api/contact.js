import { Resend } from 'resend'

const allowedServices = new Set(['Engineering & Construction','Steel Detailing','Accounting & Bookkeeping','Administrative Support','Creative Services','Not sure yet'])
const clean = (value, limit) => String(value ?? '').trim().slice(0, limit)
const escapeHtml = (value) => clean(value, 5000).replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]))

export default async function handler(request, response) {
  try {
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
    if (!process.env.RESEND_API_KEY) return response.status(500).json({ error: 'Email service is not configured on the deployed website.' })
    const name = clean(request.body?.name, 120)
    const email = clean(request.body?.email, 254)
    const service = clean(request.body?.service, 100)
    const summary = clean(request.body?.summary, 4000)
    if (clean(request.body?.website, 200)) return response.status(200).json({ ok: true })
    if (!name || !summary || !/^\S+@\S+\.\S+$/.test(email) || !allowedServices.has(service)) return response.status(400).json({ error: 'Please complete all required fields correctly.' })
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'RIJJID Website <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO_EMAIL || 'rijjidtechsolutions@gmail.com'],
      replyTo: email,
      subject: `New RIJJID inquiry: ${service}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171717"><h1 style="color:#b87900">New project inquiry</h1><p><strong>Name or company:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Service:</strong> ${escapeHtml(service)}</p><p><strong>Project summary:</strong></p><p style="white-space:pre-wrap">${escapeHtml(summary)}</p></div>`,
      text: `New RIJJID project inquiry\n\nName or company: ${name}\nEmail: ${email}\nService: ${service}\n\nProject summary:\n${summary}`,
    })
    if (error) return response.status(502).json({ error: error.message || 'The message could not be sent. Please try again.' })
    return response.status(200).json({ ok: true })
  } catch (error) {
    console.error('Contact endpoint failed:', error)
    return response.status(500).json({ error: 'The email service encountered an error. Please try again or email rijjidtechsolutions@gmail.com directly.' })
  }
}
