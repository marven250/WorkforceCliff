"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCorsOptions = buildCorsOptions;
const isProd = process.env.NODE_ENV === "production";
function parseAllowedOrigins() {
    var _a;
    const raw = (_a = process.env.CORS_ORIGINS) === null || _a === void 0 ? void 0 : _a.trim();
    if (!raw)
        return [];
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}
/** Local Vite / preview dev servers (only used when CORS_ORIGINS is unset in non-production). */
function isDevLocalhostOrigin(origin) {
    if (!origin)
        return true;
    try {
        const u = new URL(origin);
        if (u.protocol !== "http:" && u.protocol !== "https:")
            return false;
        if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1")
            return false;
        return true;
    }
    catch (_a) {
        return false;
    }
}
/**
 * CORS: production requires `CORS_ORIGINS` (comma-separated exact origins, e.g. https://app.example.com).
 * Development defaults to allowing http(s)://localhost and 127.0.0.1 with any port.
 */
function buildCorsOptions() {
    const allowed = parseAllowedOrigins();
    if (isProd) {
        if (allowed.length === 0) {
            throw new Error("Production requires CORS_ORIGINS (comma-separated list), e.g. CORS_ORIGINS=https://app.example.com");
        }
        return {
            origin(origin, callback) {
                if (!origin) {
                    callback(null, true);
                    return;
                }
                if (allowed.includes(origin)) {
                    callback(null, true);
                    return;
                }
                callback(null, false);
            },
            credentials: true,
            optionsSuccessStatus: 204,
        };
    }
    if (allowed.length > 0) {
        return {
            origin(origin, callback) {
                if (!origin) {
                    callback(null, true);
                    return;
                }
                if (allowed.includes(origin)) {
                    callback(null, true);
                    return;
                }
                callback(null, false);
            },
            credentials: true,
            optionsSuccessStatus: 204,
        };
    }
    return {
        origin(origin, callback) {
            if (isDevLocalhostOrigin(origin)) {
                callback(null, true);
                return;
            }
            callback(null, false);
        },
        credentials: true,
        optionsSuccessStatus: 204,
    };
}
