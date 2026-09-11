import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';

const emulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const hasEmulator = Boolean(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || import.meta.env.VITE_USE_FIREBASE_EMULATOR);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (hasEmulator ? 'demo-key' : undefined),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (hasEmulator ? 'mjolnir-local.firebaseapp.com' : undefined),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (hasEmulator ? 'mjolnir-local' : undefined),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
const app = hasFirebaseConfig ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
export const auth: Auth | null = app ? getAuth(app) : null;

if (auth && hasEmulator) {
  try {
    const hostUrl = emulatorHost.startsWith('http') ? emulatorHost : `http://${emulatorHost}`;
    connectAuthEmulator(auth, hostUrl, { disableWarnings: true });
  } catch (e) {
    // Emulator already connected
  }
}
