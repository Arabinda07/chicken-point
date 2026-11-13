/**
 * PhonePe Developer Platform Client & Utilities
 * Reference: https://developer.phonepe.com/
 *
 * Supports Sandbox (UAT) testing and Production Merchant Integration.
 * Implements standard PhonePe checksum hashing (SHA-256 with Salt Key & Index).
 */

export type PhonePeEnvironment = 'sandbox' | 'production';

export interface PhonePeConfig {
  env: PhonePeEnvironment;
  merchantId: string;
  saltKey: string;
  saltIndex: string;
  baseUrl: string;
}

// Standard PhonePe Developer Sandbox defaults
export const PHONEPE_SANDBOX_DEFAULTS: PhonePeConfig = {
  env: 'sandbox',
  merchantId: 'PGTESTPAYUAT',
  saltKey: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
  saltIndex: '1',
  baseUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
};

export const PHONEPE_PRODUCTION_BASE_URL = 'https://api.phonepe.com/apis/hermes';

export function getPhonePeConfig(): PhonePeConfig {
  const env = (import.meta.env.VITE_PHONEPE_ENV as PhonePeEnvironment) || 'sandbox';
  const isProd = env === 'production';

  return {
    env,
    merchantId: (import.meta.env.VITE_PHONEPE_MERCHANT_ID as string) || PHONEPE_SANDBOX_DEFAULTS.merchantId,
    saltKey: (import.meta.env.VITE_PHONEPE_SALT_KEY as string) || PHONEPE_SANDBOX_DEFAULTS.saltKey,
    saltIndex: (import.meta.env.VITE_PHONEPE_SALT_INDEX as string) || PHONEPE_SANDBOX_DEFAULTS.saltIndex,
    baseUrl: isProd ? PHONEPE_PRODUCTION_BASE_URL : PHONEPE_SANDBOX_DEFAULTS.baseUrl,
  };
}

/**
 * Calculates SHA-256 hash using native Web Cryptography API (crypto.subtle).
 * Works across modern browsers, Node.js 16+, and Edge Functions.
 */
export async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates PhonePe's mandatory X-VERIFY checksum header:
 * Format: SHA256(Base64Payload + endpoint + saltKey) + "###" + saltIndex
 */
export async function generateXVerify(
  base64Payload: string,
  endpoint: string,
  saltKey: string,
  saltIndex: string,
): Promise<string> {
  const combined = `${base64Payload}${endpoint}${saltKey}`;
  const hash = await sha256Hex(combined);
  return `${hash}###${saltIndex}`;
}

/**
 * Generates PhonePe X-VERIFY for GET Status requests (no payload body):
 * Format: SHA256(endpoint + saltKey) + "###" + saltIndex
 */
export async function generateStatusXVerify(
  endpoint: string,
  saltKey: string,
  saltIndex: string,
): Promise<string> {
  const combined = `${endpoint}${saltKey}`;
  const hash = await sha256Hex(combined);
  return `${hash}###${saltIndex}`;
}

export interface PaymentInitiationParams {
  merchantTransactionId: string;
  merchantUserId: string;
  amountRupees: number;
  customerPhone?: string;
  notes?: string;
  redirectUrl?: string;
  callbackUrl?: string;
  instrumentType?: 'UPI_QR' | 'PAY_PAGE';
}

export interface PhonePePayRequest {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number; // in paise
  redirectUrl: string;
  redirectMode: 'POST' | 'REDIRECT';
  callbackUrl: string;
  mobileNumber?: string;
  paymentInstrument: {
    type: 'UPI_QR' | 'PAY_PAGE';
  };
}

/**
 * Encodes object payload to UTF-8 Base64 string safely.
 */
export function encodeBase64Payload<T>(payload: T): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes UTF-8 Base64 string back to JSON.
 */
export function decodeBase64Payload<T>(base64: string): T {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoded = new TextDecoder().decode(bytes);
  return JSON.parse(decoded) as T;
}

/**
 * Builds standard PhonePe /pg/v1/pay request and headers
 */
export async function buildPhonePePayRequest(
  params: PaymentInitiationParams,
  config = getPhonePeConfig(),
) {
  const amountPaise = Math.round(params.amountRupees * 100);
  const endpoint = '/pg/v1/pay';

  const requestBody: PhonePePayRequest = {
    merchantId: config.merchantId,
    merchantTransactionId: params.merchantTransactionId,
    merchantUserId: params.merchantUserId || `CUST_${Date.now()}`,
    amount: amountPaise,
    redirectUrl: params.redirectUrl || window.location.origin,
    redirectMode: 'REDIRECT',
    callbackUrl: params.callbackUrl || `${window.location.origin}/api/phonepe/webhook`,
    mobileNumber: params.customerPhone?.replace(/\D/g, '').slice(-10),
    paymentInstrument: {
      type: params.instrumentType || 'UPI_QR',
    },
  };

  const base64Payload = encodeBase64Payload(requestBody);
  const xVerify = await generateXVerify(base64Payload, endpoint, config.saltKey, config.saltIndex);

  return {
    url: `${config.baseUrl}${endpoint}`,
    base64Payload,
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': xVerify,
    },
    rawRequest: requestBody,
  };
}

/**
 * Generates an internal merchant transaction ID formatted for the shop:
 * e.g., BKP_20260905_1615_X8K2
 */
export function generateShopTransactionId(prefix = 'BKP'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = new Date().toTimeString().slice(0, 5).replace(/:/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}_${dateStr}_${timeStr}_${randomSuffix}`;
}

/**
 * Verifies if an incoming webhook payload was authentically sent by PhonePe.
 */
export async function verifyPhonePeWebhook(
  base64Response: string,
  receivedXVerify: string,
  saltKey = getPhonePeConfig().saltKey,
  saltIndex = getPhonePeConfig().saltIndex,
): Promise<boolean> {
  if (!receivedXVerify || !base64Response) return false;
  const computedHash = await sha256Hex(`${base64Response}${saltKey}`);
  const expectedXVerify = `${computedHash}###${saltIndex}`;
  return receivedXVerify.trim() === expectedXVerify.trim();
}

/**
 * Generates an Instant UPI payment intent URL for counter display or dynamic QR.
 * Format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
 */
export function buildCounterUpiUri(params: {
  upiId: string;
  payeeName: string;
  amountRupees: number;
  transactionId: string;
  notes?: string;
}): string {
  const query = new URLSearchParams({
    pa: params.upiId,
    pn: params.payeeName,
    am: params.amountRupees.toFixed(2),
    cu: 'INR',
    tn: params.notes || `Counter bill ${params.transactionId}`,
    tr: params.transactionId,
  });
  return `upi://pay?${query.toString()}`;
}
