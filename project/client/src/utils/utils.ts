import { parsePhoneNumberFromString } from "libphonenumber-js";

/** US national format, e.g. (555) 234-5678. Returns null if empty after trim. */
export function formatPhoneUsNational(phoneNumber: string): string | null {
  const trimmed = phoneNumber.trim();
  if (!trimmed) return null;
  const phone = parsePhoneNumberFromString(trimmed, "US");
  if (phone?.isValid()) {
    return phone.formatNational();
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return trimmed;
}

export function formatPhoneNumber(phoneNumber: string) {
  return formatPhoneUsNational(phoneNumber);
}
