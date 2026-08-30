import { bearerToken } from '../../server/assessBackend.js';
import { issueAssessDelivery } from '../../server/assessAdminBackend.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return send(res, 405, { code: 'method_not_allowed', message: 'Method not allowed.' });
  try {
    const token = bearerToken(req);
    const delivery = await issueAssessDelivery({
      token,
      setId: req.body?.setId
    });
    return send(res, 200, { delivery });
  } catch (error) {
    return send(res, Number(error?.status ?? 500), {
      code: error?.code ?? 'assess_issue_error',
      message: error?.message ?? 'Assess delivery could not be issued.'
    });
  }
}

function send(res, status, payload) {
  res.status(status).json(payload);
}
