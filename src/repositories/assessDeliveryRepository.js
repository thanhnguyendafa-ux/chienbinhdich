import { getFirebaseClient, waitForFirebaseAuth } from './firebaseClient.js';

const ADMIN_CONTEXT = 'admin';

export function createAssessDeliveryRepository(project) {
  let clientPromise = null;
  const adminClient = () => {
    clientPromise ??= getFirebaseClient(project, ADMIN_CONTEXT);
    return clientPromise;
  };

  return Object.freeze({
    async createDelivery(setId) {
      const client = await adminClient();
      const user = await waitForFirebaseAuth(client);
      if (!user) throw new Error('Cần đăng nhập Admin để phát hành Assess.');
      const token = await user.getIdToken();
      const response = await fetch('/api/assess/issue', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ setId: String(setId ?? '').trim() })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.delivery) {
        const error = new Error(payload?.message ?? 'Không phát hành được Assess.');
        error.code = payload?.code ?? 'assess_issue_error';
        throw error;
      }
      return Object.freeze(payload.delivery);
    },

    buildUrl(locationLike, delivery) {
      const origin = new URL(locationLike?.href ?? String(locationLike ?? 'https://example.invalid/'), 'https://example.invalid').origin;
      const assignment = `${delivery.slug}-${delivery.code}`;
      return `${origin}/assess?assignment=${encodeURIComponent(assignment)}`;
    }
  });
}
