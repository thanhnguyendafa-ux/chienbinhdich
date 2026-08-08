export const FIREBASE_SDK_VERSION = '12.16.0';

const FIREBASE_SDK_BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;
const clients = new Map();

export function validateFirebaseProjectConfig(project) {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  return required.filter(key => typeof project?.[key] !== 'string' || project[key].trim() === '');
}

export async function getFirebaseClient(project, context = 'student') {
  const missing = validateFirebaseProjectConfig(project);
  if (missing.length) throw new Error(`Firebase config is missing: ${missing.join(', ')}`);

  const key = `${project.projectId}:${context}`;
  if (!clients.has(key)) clients.set(key, initializeClient(project, context));
  return clients.get(key);
}

export async function waitForFirebaseAuth(client) {
  if (typeof client.auth.authStateReady === 'function') {
    await client.auth.authStateReady();
    return client.auth.currentUser;
  }

  return new Promise((resolve, reject) => {
    const unsubscribe = client.authSdk.onAuthStateChanged(
      client.auth,
      user => {
        unsubscribe();
        resolve(user);
      },
      error => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

export async function ensureAnonymousFirebaseUser(client) {
  const current = await waitForFirebaseAuth(client);
  if (current?.isAnonymous) return current;
  if (current) await client.authSdk.signOut(client.auth);
  const credential = await client.authSdk.signInAnonymously(client.auth);
  return credential.user;
}

export async function signInFirebaseAdmin(client, email, password) {
  const normalizedEmail = String(email ?? '').trim();
  if (!normalizedEmail || !password) throw new Error('Email và mật khẩu quản trị là bắt buộc.');
  const credential = await client.authSdk.signInWithEmailAndPassword(client.auth, normalizedEmail, password);
  return credential.user;
}

export async function signOutFirebaseClient(client) {
  await client.authSdk.signOut(client.auth);
}

async function initializeClient(project, context) {
  const [appSdk, authSdk, firestoreSdk] = await Promise.all([
    import(`${FIREBASE_SDK_BASE}/firebase-app.js`),
    import(`${FIREBASE_SDK_BASE}/firebase-auth.js`),
    import(`${FIREBASE_SDK_BASE}/firebase-firestore.js`)
  ]);

  const appName = `cbd-${context}-${project.projectId}`;
  const app = appSdk.getApps().find(candidate => candidate.name === appName)
    ?? appSdk.initializeApp(project, appName);
  const auth = authSdk.getAuth(app);
  const db = firestoreSdk.getFirestore(app);

  return {
    app,
    auth,
    db,
    authSdk,
    firestore: firestoreSdk
  };
}
