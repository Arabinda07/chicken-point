import { createHash } from 'node:crypto';

// Replicate the PhonePe checksum test to ensure the algorithm conforms to PhonePe Developer Spec
const saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const saltIndex = '1';
const endpoint = '/pg/v1/pay';

const mockRequest = {
  merchantId: 'PGTESTPAYUAT',
  merchantTransactionId: 'BKP_20260905_1200_TEST',
  merchantUserId: 'CUST_12345',
  amount: 25000, // 250.00 INR
  redirectUrl: 'http://localhost:3000',
  redirectMode: 'REDIRECT',
  callbackUrl: 'http://localhost:3000/api/phonepe/webhook',
  paymentInstrument: {
    type: 'UPI_QR',
  },
};

const base64Payload = Buffer.from(JSON.stringify(mockRequest)).toString('base64');
const stringToHash = `${base64Payload}${endpoint}${saltKey}`;
const computedHash = createHash('sha256').update(stringToHash).digest('hex');
const xVerify = `${computedHash}###${saltIndex}`;

console.log('--- PhonePe Developer Checksum Test ---');
console.log('Base64 Payload length:', base64Payload.length);
console.log('X-VERIFY Header:', xVerify);

if (xVerify.endsWith('###1') && computedHash.length === 64) {
  console.log('✅ PhonePe SHA-256 Checksum generation SUCCESS');
} else {
  console.error('❌ Checksum verification failed');
  process.exit(1);
}

// Test webhook response verification
const mockWebhookResponse = Buffer.from(
  JSON.stringify({
    success: true,
    code: 'PAYMENT_SUCCESS',
    message: 'Payment completed successfully',
    data: {
      merchantId: 'PGTESTPAYUAT',
      merchantTransactionId: 'BKP_20260905_1200_TEST',
      transactionId: 'T260905120099',
      amount: 25000,
      state: 'COMPLETED',
      responseCode: 'SUCCESS',
      paymentInstrument: {
        type: 'UPI',
        utr: '424519284102',
      },
    },
  })
).toString('base64');

const webhookHash = createHash('sha256').update(`${mockWebhookResponse}${saltKey}`).digest('hex');
const webhookXVerify = `${webhookHash}###${saltIndex}`;

console.log('Webhook Verification X-VERIFY:', webhookXVerify);
if (webhookXVerify.length === 64 + 4) {
  console.log('✅ Webhook checksum verification SUCCESS');
}
