import { createHash, createHmac, randomInt, timingSafeEqual } from 'crypto';

const OTP_DIGITS = 6;
const OTP_MIN = 0;
const OTP_MAX = 10 ** OTP_DIGITS;

//Cryptographically secure 6-digit numeric OTP (leading zeros preserved).
export function generateNumericOtp(): string {
  const n = randomInt(OTP_MIN, OTP_MAX);
  return String(n).padStart(OTP_DIGITS, '0');
}
// Stores only a keyed HMAC — never the plaintext OTP in Redis.
export function hashOtpForStorage(
  normalizedEmail: string,
  plainOtp: string,
  secret: string,
): string {
  return createHmac('sha256', secret)
    .update(`${normalizedEmail}:${plainOtp}`)
    .digest('hex');
}

//Constant-time comparison of two equal-length hex strings (for future verify-otp).
export function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

// One-way hash for audit logs and Redis rate-limit keys (no PII).
export function hashEmailIdentifier(normalizedEmail: string): string {
  return createHash('sha256').update(normalizedEmail).digest('hex');
}
