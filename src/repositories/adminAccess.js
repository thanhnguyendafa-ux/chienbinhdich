import { waitForFirebaseAuth } from './firebaseClient.js';

export async function requireAdmin(clientFactory) {
  const client = await clientFactory();
  const user = await waitForFirebaseAuth(client);
  if (!user) throw new Error('Cần đăng nhập Admin.');
  if (!await hasAdminMarker(client, user.uid)) throw new Error('Tài khoản không có quyền Admin.');
  return { client, user };
}

export async function hasAdminMarker(client, uid) {
  const ref = client.firestore.doc(client.db, 'admins', uid);
  const snapshot = await client.firestore.getDoc(ref);
  return snapshot.exists();
}
