import { bearerToken, recordAssessAttempt } from '../../server/assessBackend.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return send(res, 405, { code: 'method_not_allowed', message: 'Method not allowed.' });
  try {
    const token = bearerToken(req);
    const payload = await recordAssessAttempt({ token, payload: req.body ?? {} });
    return send(res, 200, payload);
  } catch (error) {
    return send(res, Number(error?.status ?? 500), {
      code: error?.code ?? 'assess_backend_error',
      message: error?.message ?? 'Assess service failed.'
    });
  }
}

function send(res, status, payload) {
  res.status(status).json(payload);
}
