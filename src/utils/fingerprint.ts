import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fpPromise: ReturnType<typeof FingerprintJS.load> | null = null;

/**
 * Lazily loads the FingerprintJS agent (singleton) and returns the visitor ID.
 * Safe to call multiple times – reuses the same loaded instance.
 */
export async function getVisitorId(): Promise<string> {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
}
