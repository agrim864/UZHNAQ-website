"use strict";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function buildTextEmail({ siteName, enquiry, submittedAt, ipAddress, userAgent, origin }) {
  const lines = [
    `${siteName} enquiry received`,
    "",
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
  ];

  if (enquiry.phone) lines.push(`Phone: ${enquiry.phone}`);
  if (enquiry.company) lines.push(`Company: ${enquiry.company}`);
  if (enquiry.subject) lines.push(`Subject: ${enquiry.subject}`);
  if (enquiry.preferredContact) lines.push(`Preferred contact: ${enquiry.preferredContact}`);
  if (enquiry.page) lines.push(`Page: ${enquiry.page}`);
  if (origin) lines.push(`Origin: ${origin}`);
  if (ipAddress) lines.push(`IP address: ${ipAddress}`);
  if (userAgent) lines.push(`User agent: ${userAgent}`);

  lines.push("", "Message:", enquiry.message, "", `Submitted at: ${submittedAt}`);

  return lines.join("\n");
}

function buildHtmlEmail({ siteName, enquiry, submittedAt, ipAddress, userAgent, origin }) {
  const rows = [
    ["Name", enquiry.name],
    ["Email", `<a href="mailto:${escapeHtml(enquiry.email)}">${escapeHtml(enquiry.email)}</a>`],
  ];

  if (enquiry.phone) rows.push(["Phone", escapeHtml(enquiry.phone)]);
  if (enquiry.company) rows.push(["Company", escapeHtml(enquiry.company)]);
  if (enquiry.subject) rows.push(["Subject", escapeHtml(enquiry.subject)]);
  if (enquiry.preferredContact) rows.push(["Preferred contact", escapeHtml(enquiry.preferredContact)]);
  if (enquiry.page) rows.push(["Page", escapeHtml(enquiry.page)]);
  if (origin) rows.push(["Origin", escapeHtml(origin)]);
  if (ipAddress) rows.push(["IP address", escapeHtml(ipAddress)]);
  if (userAgent) rows.push(["User agent", escapeHtml(userAgent)]);

  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;vertical-align:top;">${value}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <div style="max-width:760px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15, 23, 42, 0.08);">
        <div style="padding:24px 28px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;">
          <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;">${escapeHtml(siteName)}</div>
          <h1 style="margin:10px 0 0;font-size:24px;line-height:1.2;">New enquiry received</h1>
        </div>
        <div style="padding:28px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.5;">
            ${tableRows}
            <tr>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;vertical-align:top;">Message</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;vertical-align:top;white-space:normal;">${nl2br(enquiry.message)}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;vertical-align:top;">Submitted at</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;vertical-align:top;">${escapeHtml(submittedAt)}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

module.exports = {
  buildHtmlEmail,
  buildTextEmail,
  escapeHtml,
};
