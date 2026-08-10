import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "";

export const resend = new Resend(apiKey);

export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Redlix Secure <no-reply@app.redlix.co.in>";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = DEFAULT_FROM_EMAIL,
}: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Resend Email Error]:", error);
      // Fallback to resend.dev default sender if custom domain is not yet verified
      if (error.message && error.message.includes("domain") && from !== "Redlix Secure <onboarding@resend.dev>") {
        console.log("[Resend Email]: Retrying with onboarding@resend.dev fallback...");
        return await sendEmail({ to, subject, html, from: "Redlix Secure <onboarding@resend.dev>" });
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend Unexpected Error]:", err);
    return { success: false, error: err.message || "Failed to send email" };
  }
}

/* ==========================================================================
   RESEND DOMAIN MANAGEMENT SERVICES
   ========================================================================== */

/** Add a new domain to Resend (default: app.redlix.co.in) */
export async function createResendDomain(name: string = "app.redlix.co.in") {
  return await resend.domains.create({ name });
}

/** Retrieve domain details by ID */
export async function getResendDomain(domainId: string) {
  return await resend.domains.get(domainId);
}

/** Trigger domain verification by ID */
export async function verifyResendDomain(domainId: string) {
  return await resend.domains.verify(domainId);
}

/** Update domain settings */
export async function updateResendDomain(domainId: string, options: { openTracking?: boolean; clickTracking?: boolean }) {
  return await resend.domains.update({
    id: domainId,
    ...options,
  });
}

/** List all configured domains in Resend account */
export async function listResendDomains() {
  return await resend.domains.list();
}

/** Delete domain by ID */
export async function removeResendDomain(domainId: string) {
  return await resend.domains.remove(domainId);
}
