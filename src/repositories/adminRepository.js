import {
  getFirebaseClient,
  signInFirebaseAdmin,
  signOutFirebaseClient,
  waitForFirebaseAuth
} from './firebaseClient.js';

const ADMIN_CONTEXT = 'admin';

export function createFirebaseAdminRepository(project) {
  let clientPromise = null;
  const adminClient = () => {
    clientPromise ??= getFirebaseClient(project, ADMIN_CONTEXT);
    return clientPromise;
  };

  return Object.freeze({
    async getAdminState() {
      const client = await adminClient();
      const user = await waitForFirebaseAuth(client);
      if (!user) return { authenticated: false, isAdmin: false, user: null };
      const isAdmin = await hasAdminMarker(client, user.uid);
      return { authenticated: true, isAdmin, user };
    },

    async signInAdmin(email, password) {
      const client = await adminClient();
      const user = await signInFirebaseAdmin(client, email, password);
      const isAdmin = await hasAdminMarker(client, user.uid);
      if (!isAdmin) {
        await signOutFirebaseClient(client);
        throw new Error('Tài khoản này chưa được cấp quyền Admin Chiến Binh Dịch.');
      }
      return { user, isAdmin: true };
    },

    async signOutAdmin() {
      const client = await adminClient();
      await signOutFirebaseClient(client);
    },

    async listSessions(limitCount = 100) {
      const { client } = await requireAdmin(adminClient);
      const { firestore, db } = client;
      const query = firestore.query(
        firestore.collection(db, 'sessions'),
        firestore.orderBy('syncedAt', 'desc'),
        firestore.limit(limitCount)
      );
      const snapshot = await firestore.getDocs(query);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    },

    async getSessionDetail(sessionId) {
      const { client } = await requireAdmin(adminClient);
      const { firestore, db } = client;
      const sessionRef = firestore.doc(db, 'sessions', sessionId);
      const [sessionSnapshot, attemptsSnapshot] = await Promise.all([
        firestore.getDoc(sessionRef),
        firestore.getDocs(
          firestore.query(
            firestore.collection(db, 'sessions', sessionId, 'attempts'),
            firestore.orderBy('submittedAt', 'asc')
          )
        )
      ]);

      if (!sessionSnapshot.exists()) throw new Error('Không tìm thấy session.');
      return {
        session: { ...sessionSnapshot.data(), id: sessionSnapshot.id },
        attempts: attemptsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      };
    }
  });
}

async function requireAdmin(clientFactory) {
  const client = await clientFactory();
  const user = await waitForFirebaseAuth(client);
  if (!user) throw new Error('Cần đăng nhập Admin.');
  if (!await hasAdminMarker(client, user.uid)) throw new Error('Tài khoản không có quyền Admin.');
  return { client, user };
}

async function hasAdminMarker(client, uid) {
  const ref = client.firestore.doc(client.db, 'admins', uid);
  const snapshot = await client.firestore.getDoc(ref);
  return snapshot.exists();
}
