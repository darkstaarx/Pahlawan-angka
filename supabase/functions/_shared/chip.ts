// CHIP Collect (https://docs.chip-in.asia) helpers shared by checkout and callback.
import { createVerify } from 'node:crypto';
import { Buffer } from 'node:buffer';

export const CHIP_API = 'https://gate.chip-in.asia/api/v1';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** CHIP purchase ids are UUIDs; legacy ToyyibPay bill codes are not. */
export function chipPurchaseId(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

export async function chipRequest(secretKey: string, path: string, init: { method?: string; body?: unknown } = {}) {
  const response = await fetch(`${CHIP_API}${path}`, {
    method: init.method ?? 'GET',
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await response.text();
  let data: any = null;
  try { data = JSON.parse(text); } catch { data = null; }
  if (!response.ok) {
    console.error('chip_request_failed', { path: path.replace(/[0-9a-f-]{36}/gi, ':id'), status: response.status });
    return null;
  }
  return data;
}

let cachedPublicKey: string | null = null;
/** PEM used to verify X-Signature. The endpoint returns the PEM as a JSON string. */
async function publicKey(secretKey: string, refresh = false) {
  if (cachedPublicKey && !refresh) return cachedPublicKey;
  const pem = await chipRequest(secretKey, '/public_key/');
  if (typeof pem !== 'string' || !pem.includes('PUBLIC KEY')) throw new Error('CHIP public key unavailable');
  cachedPublicKey = pem;
  return pem;
}

function verifyWith(pem: string, rawBody: Uint8Array, signatureB64: string) {
  const verifier = createVerify('RSA-SHA256');
  verifier.update(rawBody);
  verifier.end();
  return verifier.verify(pem, Buffer.from(signatureB64, 'base64'));
}

/** RSA PKCS#1 v1.5 + SHA-256 over the raw request body, signature base64 in X-Signature. */
export async function verifyChipSignature(secretKey: string, rawBody: Uint8Array, signatureB64: string | null) {
  if (!signatureB64) return false;
  try {
    if (verifyWith(await publicKey(secretKey), rawBody, signatureB64)) return true;
    // The key may have rotated since it was cached: retry once with a fresh copy.
    return verifyWith(await publicKey(secretKey, true), rawBody, signatureB64);
  } catch (error) {
    console.error('chip_signature_check_failed', { kind: error instanceof Error ? error.name : 'unknown' });
    return false;
  }
}
