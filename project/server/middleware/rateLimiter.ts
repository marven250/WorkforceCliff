import rateLimit from "express-rate-limit";

/** General API traffic (authenticated app usage). */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/** Login and registration (credential stuffing / brute force). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: "Too many sign-in attempts from this address. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/** Public marketing inquiry forms (spam / abuse). */
export const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: "Too many inquiry submissions. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
