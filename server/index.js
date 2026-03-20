"use strict";

require("dotenv").config();

const cors = require("cors");
const express = require("express");
const nodemailer = require("nodemailer");
const { buildHtmlEmail, buildTextEmail } = require("./lib/email");
const { normalizeEnquiry, truncate, validateEnquiry } = require("./lib/validation");

const app = express();
app.set("trust proxy", true);

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";
const siteName = process.env.SITE_NAME || "UZHNAQ";
const siteUrl = process.env.SITE_URL || "https://www.uzhnaq.com";
const mailFrom = process.env.SMTP_FROM || "UZHNAQ Website <no-reply@uzhnaq.com>";
const mailTo = process.env.SMTP_TO || "support@uzhnaq.com";
const maxBodySize = process.env.MAX_BODY_SIZE || "50kb";
const maxMessageLength = Number(process.env.MAX_MESSAGE_LENGTH || 4000);
const maxSubjectLength = Number(process.env.MAX_SUBJECT_LENGTH || 160);
const maxFieldLength = Number(process.env.MAX_FIELD_LENGTH || 120);

function parseAllowedOrigins(rawValue) {
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function createCorsOptions() {
  const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

  if (allowedOrigins.length === 0) {
    return { origin: true };
  }

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS policy."));
    },
  };
}

function createTransport() {
  const portValue = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: portValue,
    secure,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "";
}

function validateEnvironment() {
  const missing = [];

  if (!process.env.SMTP_HOST) missing.push("SMTP_HOST");
  if (!process.env.SMTP_USER) missing.push("SMTP_USER");
  if (!process.env.SMTP_PASS) missing.push("SMTP_PASS");

  return missing;
}

app.use(cors(createCorsOptions()));
app.use(express.json({ limit: maxBodySize }));
app.use(express.urlencoded({ extended: true, limit: maxBodySize }));

app.get("/healthz", (_req, res) => {
  res.json({
    ok: true,
    service: "uzhnaq-enquiry-backend",
    siteName,
  });
});

app.post("/api/enquiry", async (req, res, next) => {
  try {
    const honeypot = normalizeEnquiry(req.body).honeypot;
    if (honeypot) {
      res.status(202).json({
        ok: true,
        accepted: true,
        message: "Thanks, your enquiry has been received.",
      });
      return;
    }

    const enquiry = normalizeEnquiry(req.body);
    enquiry.subject = truncate(enquiry.subject, maxSubjectLength);
    enquiry.message = truncate(enquiry.message, maxMessageLength);
    enquiry.name = truncate(enquiry.name, maxFieldLength);
    enquiry.phone = truncate(enquiry.phone, maxFieldLength);
    enquiry.company = truncate(enquiry.company, maxFieldLength);
    enquiry.page = truncate(enquiry.page, 300);
    enquiry.preferredContact = truncate(enquiry.preferredContact, maxFieldLength);

    const validation = validateEnquiry(enquiry, {
      maxFieldLength,
      maxMessageLength,
      maxSubjectLength,
    });

    if (!validation.ok) {
      res.status(422).json({
        ok: false,
        message: "Please review the enquiry form and try again.",
        errors: validation.errors,
      });
      return;
    }

    const transport = createTransport();
    const submittedAt = new Date().toISOString();
    const ipAddress = getClientIp(req);
    const userAgent = req.get("user-agent") || "";
    const origin = req.get("origin") || siteUrl;
    const subject = enquiry.subject
      ? `UZHNAQ enquiry: ${enquiry.subject}`
      : `UZHNAQ enquiry from ${enquiry.name}`;

    const emailText = buildTextEmail({
      siteName,
      enquiry,
      submittedAt,
      ipAddress,
      userAgent,
      origin,
    });

    const emailHtml = buildHtmlEmail({
      siteName,
      enquiry,
      submittedAt,
      ipAddress,
      userAgent,
      origin,
    });

    const info = await transport.sendMail({
      from: mailFrom,
      to: mailTo,
      replyTo: enquiry.email,
      subject,
      text: emailText,
      html: emailHtml,
    });

    res.status(200).json({
      ok: true,
      message: "Enquiry sent successfully.",
      messageId: info.messageId,
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const isConfigError =
    error instanceof Error &&
    (error.message.includes("Origin not allowed by CORS policy") ||
      error.message.includes("Invalid login") ||
      error.code === "EAUTH");

  if (error instanceof Error && error.message.includes("Origin not allowed by CORS policy")) {
    res.status(403).json({
      ok: false,
      message: "Origin not allowed.",
    });
    return;
  }

  if (isConfigError) {
    res.status(500).json({
      ok: false,
      message: "Backend configuration error.",
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    ok: false,
    message: "Unable to process the enquiry right now.",
  });
});

const missingEnv = validateEnvironment();
if (missingEnv.length > 0) {
  console.warn(
    `Warning: missing required SMTP env vars: ${missingEnv.join(", ")}. The server will start, but sending mail will fail until they are set.`
  );
}

app.listen(port, host, () => {
  console.log(`UZHNAQ enquiry backend listening on http://${host}:${port}`);
  console.log(`Sending enquiries to ${mailTo}`);
});
