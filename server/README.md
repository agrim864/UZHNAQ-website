# UZHNAQ Enquiry Backend

This folder contains a lightweight Node.js backend for the enquiry form.

## What it does

- Accepts enquiry submissions at `POST /api/enquiry`
- Sends a formatted email to `support@uzhnaq.com` using SMTP
- Returns JSON success and validation errors
- Supports both JSON and `application/x-www-form-urlencoded` submissions

## Setup

```bash
cd server
npm install
copy .env.example .env
```

Fill in your SMTP credentials in `.env`, then start the server:

```bash
npm start
```

For local development with file watching:

```bash
npm run dev
```

## Environment variables

- `PORT` - server port, default `3001`
- `HOST` - bind host, default `0.0.0.0`
- `ALLOWED_ORIGINS` - comma-separated browser origins allowed by CORS
- `SITE_NAME` - site name used in emails
- `SITE_URL` - canonical site URL used in email metadata
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port, usually `587` or `465`
- `SMTP_SECURE` - `true` for SMTPS, otherwise `false`
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password or app password
- `SMTP_FROM` - sender identity shown in the email
- `SMTP_TO` - destination address, defaults to `support@uzhnaq.com`
- `MAX_BODY_SIZE` - request body limit, default `50kb`
- `MAX_MESSAGE_LENGTH` - maximum enquiry message size
- `MAX_SUBJECT_LENGTH` - maximum subject size
- `MAX_FIELD_LENGTH` - maximum name, phone, and company size

## API

### `GET /healthz`

Returns a simple health payload.

### `POST /api/enquiry`

Accepts fields such as:

- `name`
- `email`
- `phone`
- `company`
- `subject`
- `message`
- `page`
- `preferredContact`

Optional honeypot fields supported:

- `website`
- `webSite`
- `urlField`
- `companyWebsite`
- `hp`
- `botField`

Example JSON:

```json
{
  "name": "Amit Sharma",
  "email": "amit@example.com",
  "phone": "+91 98765 43210",
  "company": "ABC Industries",
  "subject": "Gear enquiry",
  "message": "We would like a quotation for a custom gear set.",
  "page": "contact.html"
}
```

Validation errors are returned with HTTP `422` and a field-level `errors` object.
