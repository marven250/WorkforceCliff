import type { CorsOptions } from "cors";

const isProd = process.env.NODE_ENV === "production";

function parseAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Local Vite / preview dev servers (only used when CORS_ORIGINS is unset in non-production). */
function isDevLocalhostOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1") return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * CORS: production requires `CORS_ORIGINS` (comma-separated exact origins, e.g. https://app.example.com).
 * Development defaults to allowing http(s)://localhost and 127.0.0.1 with any port.
 */
export function buildCorsOptions(): CorsOptions {
  const allowed = parseAllowedOrigins();
  if (isProd) {
    if (allowed.length === 0) {
      throw new Error(
        "Production requires CORS_ORIGINS (comma-separated list), e.g. CORS_ORIGINS=https://app.example.com",
      );
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
