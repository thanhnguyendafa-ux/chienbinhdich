import { firebaseConfig } from '../../src/config/firebaseConfig.js';
import { createFirestoreRestClient } from '../../server/firestoreRest.js';
import { getPrivilegedGoogleAccessToken } from '../../server/googleAccessToken.js';

const firestore = createFirestoreRestClient(firebaseConfig.project.projectId);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ ok: false, code: 'method_not_allowed' });
  try {
    const token = await getPrivilegedGoogleAccessToken();
    await firestore.getDocument('admins/__assess_health__', token);
    return res.status(200).json({ ok: true, identity: 'google-workload' });
  } catch (error) {
    return res.status(Number(error?.status ?? 500)).json({
      ok: false,
      code: error?.code ?? 'assess_health_error',
      message: error?.message ?? 'Assess backend identity is unavailable.'
    });
  }
}
