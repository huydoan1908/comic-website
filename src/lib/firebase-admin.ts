import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const ADMIN_APP_NAME = 'comic-website-admin';

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

function getAdminApp(): App {
  const existing = getApps().find(app => app.name === ADMIN_APP_NAME);
  if (existing) {
    return existing;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Service-account keys are stored with escaped newlines in .env files.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n');

  const missing = [
    !projectId && 'FIREBASE_PROJECT_ID',
    !clientEmail && 'FIREBASE_CLIENT_EMAIL',
    !privateKey && 'FIREBASE_PRIVATE_KEY',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Firebase Admin credentials missing: ${missing.join(', ')}`);
  }

  return initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    },
    ADMIN_APP_NAME
  );
}

/**
 * Verifies the caller's Firebase ID token and confirms they are an admin.
 * Returns the uid, or throws an AuthError carrying the HTTP status to respond with.
 */
export async function requireAdmin(authHeader: string | null): Promise<string> {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    throw new AuthError('Missing authentication token', 401);
  }

  const app = getAdminApp();

  let uid: string;
  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    throw new AuthError('Invalid authentication token', 401);
  }

  const userDoc = await getFirestore(app).collection('users').doc(uid).get();

  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    throw new AuthError('Admin access required', 403);
  }

  return uid;
}
