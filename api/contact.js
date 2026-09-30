import { Resend } from 'resend'

const allowedServices = new Set(['Engineering & Construction','Steel Detailing','Accounting & Bookkeeping','Administrative Support','Creative Services','Not sure yet'])
const clean = (value, limit) => String(value ?? '').trim().slice(0, limit)
const escapeHtml = (value) => clean(value, 5000).replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]))
const buildEmailHtml = ({ name, email, service, summary, submittedAt }) => `
<!doctype html>
<html><body style="margin:0;padding:0;background:#f2f2f0;font-family:Arial,Helvetica,sans-serif;color:#181818">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f2f0;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #deded9;border-radius:12px;overflow:hidden">
        <tr><td style="height:6px;background:#fdb010;font-size:0">&nbsp;</td></tr>
        <tr><td style="padding:28px 32px;background:#171717">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
            <td><div style="font-size:23px;line-height:1;font-weight:800;letter-spacing:3px;color:#ffffff">RIJJID</div><div style="margin-top:7px;font-size:10px;letter-spacing:2px;color:#fdb010">TECHNICAL SOLUTIONS</div></td>
            <td align="right"><span style="display:inline-block;padding:7px 10px;border:1px solid #545454;border-radius:99px;font-size:10px;letter-spacing:1px;color:#c8c8c8">NEW INQUIRY</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1.5px;color:#9a7109">WEBSITE CONTACT</p>
          <h1 style="margin:0 0 8px;font-size:28px;line-height:1.25;color:#181818">New project inquiry</h1>
          <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#6b6b67">A prospective client submitted the RIJJID website contact form.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse">
            <tr><td style="width:145px;padding:13px 0;border-top:1px solid #e5e5e0;font-size:11px;font-weight:700;letter-spacing:1px;color:#888883">NAME / COMPANY</td><td style="padding:13px 0;border-top:1px solid #e5e5e0;font-size:14px;font-weight:700;color:#181818">${escapeHtml(name)}</td></tr>
            <tr><td style="width:145px;padding:13px 0;border-top:1px solid #e5e5e0;font-size:11px;font-weight:700;letter-spacing:1px;color:#888883">EMAIL</td><td style="padding:13px 0;border-top:1px solid #e5e5e0;font-size:14px"><a href="mailto:${encodeURIComponent(email)}" style="color:#9a6a00;text-decoration:none">${escapeHtml(email)}</a></td></tr>
            <tr><td style="width:145px;padding:13px 0;border-top:1px solid #e5e5e0;font-size:11px;font-weight:700;letter-spacing:1px;color:#888883">SERVICE</td><td style="padding:13px 0;border-top:1px solid #e5e5e0;font-size:14px;color:#181818">${escapeHtml(service)}</td></tr>
            <tr><td style="width:145px;padding:13px 0;border-top:1px solid #e5e5e0;font-size:11px;font-weight:700;letter-spacing:1px;color:#888883">RECEIVED</td><td style="padding:13px 0;border-top:1px solid #e5e5e0;font-size:14px;color:#181818">${escapeHtml(submittedAt)}</td></tr>
          </table>
          <div style="margin-top:24px;padding:20px;background:#f7f6f2;border-left:4px solid #fdb010;border-radius:4px">
            <p style="margin:0 0 9px;font-size:11px;font-weight:700;letter-spacing:1px;color:#777772">PROJECT SUMMARY</p>
            <p style="margin:0;white-space:pre-wrap;font-size:15px;line-height:1.7;color:#262624">${escapeHtml(summary)}</p>
          </div>
          <div style="margin-top:28px"><a href="mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: Your RIJJID ${service} inquiry`)}" style="display:inline-block;padding:13px 19px;background:#fdb010;border-radius:4px;font-size:14px;font-weight:700;color:#171717;text-decoration:none">Reply to ${escapeHtml(name)}</a></div>
        </td></tr>
        <tr><td style="padding:18px 32px;background:#f7f6f2;border-top:1px solid #e5e5e0;font-size:11px;line-height:1.6;color:#8a8a85">Sent securely from the RIJJID Technical Solutions website. Replying to this email will contact the sender directly.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

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
    const submittedAt = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date())
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'RIJJID Website <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO_EMAIL || 'rijjidtechsolutions@gmail.com'],
      replyTo: email,
      subject: `New RIJJID inquiry: ${service}`,
      html: buildEmailHtml({ name, email, service, summary, submittedAt }),
      text: `New RIJJID project inquiry\n\nName or company: ${name}\nEmail: ${email}\nService: ${service}\n\nProject summary:\n${summary}`,
    })
    if (error) return response.status(502).json({ error: error.message || 'The message could not be sent. Please try again.' })
    return response.status(200).json({ ok: true })
  } catch (error) {
    console.error('Contact endpoint failed:', error)
    return response.status(500).json({ error: 'The email service encountered an error. Please try again or email rijjidtechsolutions@gmail.com directly.' })
  }
}
