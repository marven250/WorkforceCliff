"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isProd = process.env.NODE_ENV === "production";
const secretFromEnv = (_a = process.env.JWT_SECRET) === null || _a === void 0 ? void 0 : _a.trim();
if (isProd) {
    if (!secretFromEnv || secretFromEnv.length < 32) {
        throw new Error("Production requires JWT_SECRET with at least 32 characters. Generate one with: openssl rand -base64 48");
    }
}
else if (!secretFromEnv) {
    console.warn("[auth] JWT_SECRET is not set; using a development-only default. Set JWT_SECRET before any shared or hosted environment.");
}
const JWT_SECRET = secretFromEnv || "dev-only-change-JWT_SECRET-in-production";
const JWT_EXPIRES = (process.env.JWT_EXPIRES_IN || "7d");
const signOptions = {
    expiresIn: JWT_EXPIRES,
    algorithm: "HS256",
};
const verifyOptions = {
    algorithms: ["HS256"],
};
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, signOptions);
}
function verifyAccessToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET, verifyOptions);
    const subRaw = decoded.sub;
    const sub = typeof subRaw === "number" ? subRaw : typeof subRaw === "string" ? parseInt(subRaw, 10) : NaN;
    if (!Number.isFinite(sub) || !decoded.email || !decoded.role) {
        throw new Error("Invalid token payload");
    }
    return { sub, email: decoded.email, role: decoded.role };
}
