import Handlebars from "handlebars";
import type { EducationProviderInquiryInput, EmployerInquiryInput } from "../../shared/Inquiry";
import { listPlatformAdminEmails } from "../repos/authAccounts";
import { sendMail } from "./smtpMailer";

const employerText = Handlebars.compile(
  [
    "A new employer inquiry was submitted on Workforce Cliff.",
    "",
    "Inquiry ID: {{id}}",
    "Organization: {{organizationLegalName}}",
    "Contact: {{contactFirstName}} {{contactLastName}}",
    "Email: {{email}}",
    "Phone: {{phone}}",
    "State: {{state}}",
    "Approx. employees: {{approximateEmployees}}",
    "Message:",
    "{{message}}",
  ].join("\n"),
);

const employerHtml = Handlebars.compile(
  `<p>A new employer inquiry was submitted on Workforce Cliff.</p>
<ul>
  <li><strong>Inquiry ID:</strong> {{id}}</li>
  <li><strong>Organization:</strong> {{organizationLegalName}}</li>
  <li><strong>Contact:</strong> {{contactFirstName}} {{contactLastName}}</li>
  <li><strong>Email:</strong> {{email}}</li>
  <li><strong>Phone:</strong> {{phone}}</li>
  <li><strong>State:</strong> {{state}}</li>
  <li><strong>Approx. employees:</strong> {{approximateEmployees}}</li>
</ul>
<p><strong>Message:</strong></p>
<pre style="white-space:pre-wrap;font-family:inherit">{{message}}</pre>`,
);

const providerText = Handlebars.compile(
  [
    "A new education provider inquiry was submitted on Workforce Cliff.",
    "",
    "Inquiry ID: {{id}}",
    "Institution: {{institutionName}}",
    "Contact: {{contactName}}",
    "Email: {{email}}",
    "Phone: {{phone}}",
    "State: {{state}}",
    "Website: {{website}}",
    "Programs summary: {{programsSummary}}",
    "Message:",
    "{{message}}",
  ].join("\n"),
);

const providerHtml = Handlebars.compile(
  `<p>A new education provider inquiry was submitted on Workforce Cliff.</p>
<ul>
  <li><strong>Inquiry ID:</strong> {{id}}</li>
  <li><strong>Institution:</strong> {{institutionName}}</li>
  <li><strong>Contact:</strong> {{contactName}}</li>
  <li><strong>Email:</strong> {{email}}</li>
  <li><strong>Phone:</strong> {{phone}}</li>
  <li><strong>State:</strong> {{state}}</li>
  <li><strong>Website:</strong> {{website}}</li>
  <li><strong>Programs summary:</strong> {{programsSummary}}</li>
</ul>
<p><strong>Message:</strong></p>
<pre style="white-space:pre-wrap;font-family:inherit">{{message}}</pre>`,
);

function employerPayload(id: number, input: EmployerInquiryInput) {
  return {
    id: String(id),
    organizationLegalName: input.organizationLegalName,
    contactFirstName: input.contactFirstName,
    contactLastName: input.contactLastName,
    email: input.email,
    phone: input.phone,
    state: input.state,
    approximateEmployees: input.approximateEmployees ?? "—",
    message: input.message?.trim() ? input.message : "—",
  };
}

function providerPayload(id: number, input: EducationProviderInquiryInput) {
  return {
    id: String(id),
    institutionName: input.institutionName,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    state: input.state,
    website: input.website ?? "—",
    programsSummary: input.programsSummary ?? "—",
    message: input.message?.trim() ? input.message : "—",
  };
}

export async function notifyAdminsEmployerInquiry(id: number, input: EmployerInquiryInput): Promise<void> {
  const admins = await listPlatformAdminEmails();
  if (admins.length === 0) {
    console.info("[mail] no platform_admin recipients; skipping employer inquiry notification");
    return;
  }
  const data = employerPayload(id, input);
  const subject = `New employer inquiry: ${input.organizationLegalName}`;
 
  await sendMail({
    to: admins,
    subject,
    text: employerText(data),
    html: employerHtml(data),
  });
  console.info(`[mail] employer inquiry notification sent to ${admins.length} admin(s)`);
}

export async function notifyAdminsEducationProviderInquiry(
  id: number,
  input: EducationProviderInquiryInput,
): Promise<void> {
  const admins = await listPlatformAdminEmails();
  if (admins.length === 0) {
    console.info("[mail] no platform_admin recipients; skipping education provider inquiry notification");
    return;
  }
  const data = providerPayload(id, input);
  const subject = `New education provider inquiry: ${input.institutionName}`;
  await sendMail({
    to: admins,
    subject,
    text: providerText(data),
    html: providerHtml(data),
  });
  console.info(`[mail] education provider inquiry notification sent to ${admins.length} admin(s)`);
}
