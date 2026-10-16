import * as admin from 'firebase-admin';
import env from './env';

const serviceAccountData = {
  type: env.TYPE,
  project_id: env.PROJECT_ID,
  private_key_id: env.PRIVATE_KEY_ID,
  private_key: env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: env.CLIENT_EMAIL,
  client_id: env.CLIENT_ID,
  auth_uri: env.AUTH_URI,
  token_uri: env.TOKEN_URI,
  auth_provider_x509_cert_url: env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: env.CLIENT_X509_CERT_URL,
  universe_domain: env.UNIVERSE_DOMAIN,
};

const firebaseAdmin: any = (admin as any).default || admin;

if (!firebaseAdmin.apps?.length) {
  try {
    const certFn = firebaseAdmin.credential?.cert || firebaseAdmin.cert;
    if (env.PRIVATE_KEY && env.PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
      firebaseAdmin.initializeApp({
        credential: certFn(serviceAccountData),
      });
    } else {
      // eslint-disable-next-line no-console
      console.warn('⚠️ Firebase PRIVATE_KEY is using placeholder or not configured. Push notifications disabled.');
    }
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ Firebase initialization skipped:', err?.message || err);
  }
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getMessaging } = require('firebase-admin/messaging');
  if (getMessaging && !firebaseAdmin.messaging) {
    firebaseAdmin.messaging = () => getMessaging();
  }
} catch {
  // messaging fallback
}

export default firebaseAdmin;
