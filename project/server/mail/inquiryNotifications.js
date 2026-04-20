"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAdminsEmployerInquiry = notifyAdminsEmployerInquiry;
exports.notifyAdminsEducationProviderInquiry = notifyAdminsEducationProviderInquiry;
const handlebars_1 = __importDefault(require("handlebars"));
const authAccounts_1 = require("../services/authAccounts");
const smtpMailer_1 = require("./smtpMailer");
const employerText = handlebars_1.default.compile([
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
].join("\n"));
const employerHtml = handlebars_1.default.compile(`<p>A new employer inquiry was submitted on Workforce Cliff.</p>
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
<pre style="white-space:pre-wrap;font-family:inherit">{{message}}</pre>`);
const providerText = handlebars_1.default.compile([
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
].join("\n"));
const providerHtml = handlebars_1.default.compile(`<p>A new education provider inquiry was submitted on Workforce Cliff.</p>
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
<pre style="white-space:pre-wrap;font-family:inherit">{{message}}</pre>`);
function employerPayload(id, input) {
    var _a, _b;
    return {
        id: String(id),
        organizationLegalName: input.organizationLegalName,
        contactFirstName: input.contactFirstName,
        contactLastName: input.contactLastName,
        email: input.email,
        phone: input.phone,
        state: input.state,
        approximateEmployees: (_a = input.approximateEmployees) !== null && _a !== void 0 ? _a : "—",
        message: ((_b = input.message) === null || _b === void 0 ? void 0 : _b.trim()) ? input.message : "—",
    };
}
function providerPayload(id, input) {
    var _a, _b, _c;
    return {
        id: String(id),
        institutionName: input.institutionName,
        contactName: input.contactName,
        email: input.email,
        phone: input.phone,
        state: input.state,
        website: (_a = input.website) !== null && _a !== void 0 ? _a : "—",
        programsSummary: (_b = input.programsSummary) !== null && _b !== void 0 ? _b : "—",
        message: ((_c = input.message) === null || _c === void 0 ? void 0 : _c.trim()) ? input.message : "—",
    };
}
function notifyAdminsEmployerInquiry(id, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const admins = yield (0, authAccounts_1.listPlatformAdminEmails)();
        if (admins.length === 0) {
            console.info("[mail] no platform_admin recipients; skipping employer inquiry notification");
            return;
        }
        const data = employerPayload(id, input);
        const subject = `New employer inquiry: ${input.organizationLegalName}`;
        yield (0, smtpMailer_1.sendMail)({
            to: admins,
            subject,
            text: employerText(data),
            html: employerHtml(data),
        });
        console.info(`[mail] employer inquiry notification sent to ${admins.length} admin(s)`);
    });
}
function notifyAdminsEducationProviderInquiry(id, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const admins = yield (0, authAccounts_1.listPlatformAdminEmails)();
        if (admins.length === 0) {
            console.info("[mail] no platform_admin recipients; skipping education provider inquiry notification");
            return;
        }
        const data = providerPayload(id, input);
        const subject = `New education provider inquiry: ${input.institutionName}`;
        yield (0, smtpMailer_1.sendMail)({
            to: admins,
            subject,
            text: providerText(data),
            html: providerHtml(data),
        });
        console.info(`[mail] education provider inquiry notification sent to ${admins.length} admin(s)`);
    });
}
