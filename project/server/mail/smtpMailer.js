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
exports.isMailConfigured = isMailConfigured;
exports.sendMail = sendMail;
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = require("dotenv");
const nodemailer_1 = __importDefault(require("nodemailer"));
// `__dirname` is `.../server/mail` under tsx / compiled CommonJS.
const serverRoot = node_path_1.default.resolve(__dirname, "..");
const projectRoot = node_path_1.default.resolve(__dirname, "..", "..");
// Load tracked templates first, then local `.env` (secrets override templates).
(0, dotenv_1.config)({ path: node_path_1.default.join(projectRoot, ".env.example") });
(0, dotenv_1.config)({ path: node_path_1.default.join(serverRoot, ".env.example") });
(0, dotenv_1.config)({ path: node_path_1.default.join(serverRoot, ".env"), override: true });
(0, dotenv_1.config)({ path: node_path_1.default.join(projectRoot, ".env"), override: true });
function env(name) {
    var _a;
    const v = (_a = process.env[name]) === null || _a === void 0 ? void 0 : _a.trim();
    return v || undefined;
}
function hasExplicitSmtp() {
    return Boolean(env("SMTP_HOST") && env("SMTP_PORT"));
}
function mailtrapCredentials() {
    const user = env("MAILTRAP_USER");
    const pass = env("MAILTRAP_PASS");
    if (user && pass)
        return { user, pass };
    return undefined;
}
/**
 * Mail sends when MAIL_FROM is set and either:
 * - SMTP_HOST + SMTP_PORT (any SMTP provider), or
 * - MAILTRAP_USER + MAILTRAP_PASS (Mailtrap Email Testing: sandbox.smtp.mailtrap.io:2525).
 */
function isMailConfigured() {
    if (!env("MAIL_FROM"))
        return false;
    if (hasExplicitSmtp())
        return true;
    return Boolean(mailtrapCredentials());
}
/**
 * Sends one message. If multiple recipients, uses first as To and the rest as Bcc
 * (avoids exposing admin addresses to each other).
 */
function sendMail(input) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isMailConfigured()) {
            console.info("[mail] skipped: set MAIL_FROM and either SMTP_HOST+SMTP_PORT or MAILTRAP_USER+MAILTRAP_PASS");
            return;
        }
        const { to, subject, text, html } = input;
        if (to.length === 0)
            return;
        let host;
        let port;
        let secure;
        let auth;
        if (hasExplicitSmtp()) {
            host = env("SMTP_HOST");
            const portStr = env("SMTP_PORT");
            port = Number(portStr);
            if (!Number.isFinite(port) || port <= 0) {
                console.error("[mail] invalid SMTP_PORT");
                return;
            }
            const user = env("SMTP_USER");
            const pass = env("SMTP_PASS");
            secure =
                env("SMTP_SECURE") === "true" || env("SMTP_SECURE") === "1" || port === 465;
            auth = user && pass ? { user, pass } : undefined;
        }
        else {
            const creds = mailtrapCredentials();
            if (!creds) {
                console.info("[mail] skipped: set MAIL_FROM and either SMTP_HOST+SMTP_PORT or MAILTRAP_USER+MAILTRAP_PASS");
                return;
            }
            host = "sandbox.smtp.mailtrap.io";
            port = 2525;
            secure = false;
            auth = creds;
        }
        const transporter = nodemailer_1.default.createTransport({
            host,
            port,
            secure,
            auth,
        });
        const from = env("MAIL_FROM");
        const replyTo = env("MAIL_REPLY_TO");
        const [primary, ...bccRest] = to;
        const mailOptions = {
            from,
            to: primary,
            bcc: bccRest.length > 0 ? bccRest : undefined,
            subject,
            text,
            html: html !== null && html !== void 0 ? html : text,
            replyTo: replyTo || undefined,
        };
        yield transporter.sendMail(mailOptions);
    });
}
