"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inquiryLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/** General API traffic (authenticated app usage). */
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
/** Login and registration (credential stuffing / brute force). */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 25,
    message: "Too many sign-in attempts from this address. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
/** Public marketing inquiry forms (spam / abuse). */
exports.inquiryLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 15,
    message: "Too many inquiry submissions. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
