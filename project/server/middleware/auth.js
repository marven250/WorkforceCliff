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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
exports.requireRoles = requireRoles;
const tokens_1 = require("../auth/tokens");
const authAccounts_1 = require("../services/authAccounts");
function extractBearer(req) {
    const h = req.headers.authorization;
    if (!h || !h.startsWith("Bearer "))
        return null;
    return h.slice("Bearer ".length).trim() || null;
}
function getCookie(req, name) {
    const raw = req.headers.cookie;
    if (!raw)
        return null;
    // Minimal cookie parsing (no dependencies). Format: "a=1; b=2"
    for (const part of raw.split(";")) {
        const [k, ...rest] = part.trim().split("=");
        if (!k)
            continue;
        if (k === name) {
            const v = rest.join("=");
            return v ? decodeURIComponent(v) : "";
        }
    }
    return null;
}
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = extractBearer(req)) !== null && _a !== void 0 ? _a : getCookie(req, "wc_token");
    if (!token) {
        res.status(401).json({ error: "Missing authentication token" });
        return;
    }
    try {
        const payload = (0, tokens_1.verifyAccessToken)(token);
        const account = yield (0, authAccounts_1.findAccountById)(payload.sub);
        if (!account) {
            res.status(401).json({ error: "Account no longer exists" });
            return;
        }
        req.auth = account;
        next();
    }
    catch (_b) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
});
exports.authenticate = authenticate;
function requireRoles(...allowed) {
    return (req, res, next) => {
        const user = req.auth;
        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!allowed.includes(user.role)) {
            res.status(403).json({ error: "Forbidden for this role" });
            return;
        }
        next();
    };
}
