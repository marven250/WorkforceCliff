import { parsePhoneNumberFromString } from "libphonenumber-js";

export function formatPhoneNumber(phoneNumber: string) {
  const phone = parsePhoneNumberFromString(phoneNumber, "US");
  return phone ? phone.formatInternational() : null;
}
