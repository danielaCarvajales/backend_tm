import {
  generateNumericOtp,
  hashEmailIdentifier,
  hashOtpForStorage,
  timingSafeEqualHex,
} from '../otp-hash.util';

describe('otp-hash.util', () => {
  const secret = 'x'.repeat(32);

  it('generateNumericOtp returns 6 digits', () => {
    const otp = generateNumericOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('generateNumericOtp produces different values over many draws', () => {
    const set = new Set<string>();
    for (let i = 0; i < 50; i++) {
      set.add(generateNumericOtp());
    }
    expect(set.size).toBeGreaterThan(1);
  });

  it('hashOtpForStorage is deterministic for same inputs', () => {
    const a = hashOtpForStorage('user@example.com', '123456', secret);
    const b = hashOtpForStorage('user@example.com', '123456', secret);
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('hashOtpForStorage differs when otp differs', () => {
    const a = hashOtpForStorage('user@example.com', '123456', secret);
    const b = hashOtpForStorage('user@example.com', '123457', secret);
    expect(a).not.toBe(b);
  });

  it('timingSafeEqualHex returns true for equal hex', () => {
    const h = 'ab'.repeat(32);
    expect(timingSafeEqualHex(h, h)).toBe(true);
  });

  it('timingSafeEqualHex returns false for different length', () => {
    expect(timingSafeEqualHex('ab', 'abcd')).toBe(false);
  });

  it('hashEmailIdentifier is stable', () => {
    expect(hashEmailIdentifier('a@b.co')).toBe(hashEmailIdentifier('a@b.co'));
  });
});
