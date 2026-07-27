/** Digits only, no `+`/spaces. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Normalizes a raw Ivorian phone number to `+225<digits>`, stripping any
 * `+225`/`225` prefix the caller may have already included.
 */
export function normalizePhone(rawPhone: string): string {
  const digits = digitsOnly(rawPhone);
  const withoutCountryCode = digits.startsWith('225')
    ? digits.slice(3)
    : digits;
  return `+225${withoutCountryCode}`;
}
