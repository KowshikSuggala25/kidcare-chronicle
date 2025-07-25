import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyB3vrXR98XUMdB9V7Afu-YOwfGlBurN44g",
  authDomain: "immunization-tracker-966d8.firebaseapp.com",
  projectId: "immunization-tracker-966d8",
  storageBucket: "immunization-tracker-966d8.firebasestorage.app",
  messagingSenderId: "698343288199",
  appId: "1:698343288199:web:54b61ef059fea6e6337722"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;