"use strict";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).replace(/\r\n/g, "\n").trim();
}

function truncate(value, maxLength) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function normalizeEnquiry(body = {}) {
  const enquiry = {
    name: cleanString(body.name || body.fullName || body.firstName || body.yourName),
    email: cleanString(body.email || body.replyTo || body.contactEmail),
    phone: cleanString(body.phone || body.mobile || body.telephone),
    company: cleanString(body.company || body.organisation || body.organization),
    subject: cleanString(body.subject || body.enquirySubject),
    message: cleanString(body.message || body.enquiry || body.details || body.comments),
    page: cleanString(body.page || body.sourcePage || body.referrer || body.url),
    preferredContact: cleanString(body.preferredContact || body.contactPreference),
    honeypot: cleanString(
      body.website ||
        body.webSite ||
        body.urlField ||
        body.companyWebsite ||
        body.hp ||
        body.botField
    ),
  };

  return enquiry;
}

function validateEnquiry(enquiry, limits) {
  const errors = {};
  const maxFieldLength = limits.maxFieldLength;
  const maxSubjectLength = limits.maxSubjectLength;
  const maxMessageLength = limits.maxMessageLength;

  if (!enquiry.name) {
    errors.name = "Name is required.";
  } else if (enquiry.name.length < 2) {
    errors.name = "Name must be at least 2 characters long.";
  } else if (enquiry.name.length > maxFieldLength) {
    errors.name = `Name must be at most ${maxFieldLength} characters long.`;
  }

  if (!enquiry.email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(enquiry.email)) {
    errors.email = "Email address is invalid.";
  } else if (enquiry.email.length > 254) {
    errors.email = "Email address is too long.";
  }

  if (enquiry.phone && enquiry.phone.length > maxFieldLength) {
    errors.phone = `Phone must be at most ${maxFieldLength} characters long.`;
  }

  if (enquiry.company && enquiry.company.length > maxFieldLength) {
    errors.company = `Company must be at most ${maxFieldLength} characters long.`;
  }

  if (enquiry.subject && enquiry.subject.length > maxSubjectLength) {
    errors.subject = `Subject must be at most ${maxSubjectLength} characters long.`;
  }

  if (!enquiry.message) {
    errors.message = "Message is required.";
  } else if (enquiry.message.length < 10) {
    errors.message = "Message must be at least 10 characters long.";
  } else if (enquiry.message.length > maxMessageLength) {
    errors.message = `Message must be at most ${maxMessageLength} characters long.`;
  }

  if (enquiry.page && enquiry.page.length > 300) {
    errors.page = "Page reference is too long.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = {
  cleanString,
  normalizeEnquiry,
  truncate,
  validateEnquiry,
};
