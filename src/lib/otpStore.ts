// Global in-memory OTP store for email verification
interface OtpRecord {
  otp: string;
  expiresAt: number;
}

const globalForOtp = global as unknown as { otpStore: Map<string, OtpRecord> };

export const otpStore = globalForOtp.otpStore || new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== "production") globalForOtp.otpStore = otpStore;

export function generateAndSaveOtp(email: string): string {
  const cleanEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

  otpStore.set(cleanEmail, { otp, expiresAt });
  return otp;
}

export function verifyOtp(email: string, inputOtp: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const record = otpStore.get(cleanEmail);

  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return false;
  }

  if (record.otp === inputOtp.trim()) {
    // Optionally delete once verified
    return true;
  }

  return false;
}
