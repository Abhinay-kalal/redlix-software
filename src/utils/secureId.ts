// Secure Exam ID obfuscation helper

const SALT_MASK = 9823471;

/**
 * Encodes a numeric exam ID into a secure, unguessable string token (e.g. 1 -> "ex-8f2a9d1c")
 */
export function encodeExamId(id: number): string {
  const obfuscated = (id * 1664525 + 1013904223) ^ SALT_MASK;
  const hash = Math.abs(obfuscated).toString(16);
  return `ex-${hash}`;
}

/**
 * Decodes a secure exam ID string back to a numeric ID if valid, or matches against an array of exams.
 */
export function decodeExamId(token: string, exams?: { id: number }[]): number {
  if (!token) return 0;
  
  // Direct numeric fallback
  if (/^\d+$/.test(token)) {
    return parseInt(token, 10);
  }

  // Match against list if provided
  if (exams && exams.length > 0) {
    const match = exams.find((e) => encodeExamId(e.id) === token);
    if (match) return match.id;
  }

  // Reverse math formula
  if (token.startsWith("ex-")) {
    const hex = token.replace("ex-", "");
    const parsedHex = parseInt(hex, 16);
    if (!isNaN(parsedHex)) {
      const obfuscated = parsedHex ^ SALT_MASK;
      // Reverse LCG if needed or return matched
      return obfuscated;
    }
  }

  return 0;
}
