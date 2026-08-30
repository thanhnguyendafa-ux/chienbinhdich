import { createSign } from 'node:crypto';

const PROJECT_NUMBER = '907387062033';
const WIF_POOL_ID = 'vercel-assess';
const WIF_PROVIDER_ID = 'vercel';
const WIF_AUDIENCE = `//iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIF_POOL_ID}/providers/${WIF_PROVIDER_ID}`;
const CLOUD_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
let cached = null;

export async function getPrivilegedGoogleAccessToken(now = Date.now()) {
  if (cached && cached.expiresAt - 60_000 > now) return cached.token;
  const token = process.env.FIREBASE_SERVICE_ACCOUNT_CHIENBINHDICH
    ? await serviceAccountAccessToken(now)
    : await vercelWorkloadIdentityAccessToken();
  cached = token;
  return token.token;
}

async function serviceAccountAccessToken(now) {
  const credential = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_CHIENBINHDICH);
  const tokenUrl = credential.token_uri || 'https://oauth2.googleapis.com/token';
  const issuedAt = Math.floor(now / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: credential.client_email,
    scope: CLOUD_SCOPE,
    aud: tokenUrl,
    iat: issuedAt,
    exp: issuedAt + 3600
  }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(credential.private_key).toString('base64url')}`;
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  return parseTokenResponse(response, now, 'service_account_token_error');
}

async function vercelWorkloadIdentityAccessToken() {
  const oidc = String(process.env.VERCEL_OIDC_TOKEN ?? '').trim();
  if (!oidc) throw googleAuthError('google_identity_unavailable', 'No server workload identity is available.', 503);
  const now = Date.now();
  const response = await fetch('https://sts.googleapis.com/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      audience: WIF_AUDIENCE,
      scope: CLOUD_SCOPE,
      requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      subject_token: oidc
    })
  });
  return parseTokenResponse(response, now, 'workload_identity_token_error');
}

async function parseTokenResponse(response, now, code) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    throw googleAuthError(code, payload.error_description ?? payload.error ?? 'Google access token exchange failed.', response.status || 500);
  }
  return {
    token: String(payload.access_token),
    expiresAt: now + Math.max(60, Number(payload.expires_in ?? 3600)) * 1000
  };
}

function base64url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function googleAuthError(code, message, status) {
  const error = new Error(String(message));
  error.code = code;
  error.status = status;
  return error;
}
