import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBqJVVV5tVKvN8ZrN8KfJ8KqQcKrQ8QrQ8",
  authDomain: "kidcare-chronicle-337722.firebaseapp.com",
  projectId: "kidcare-chronicle-337722",
  storageBucket: "kidcare-chronicle-337722.appspot.com",
  messagingSenderId: "698343288199",
  appId: "1:698343288199:web:54b61ef059fea6e6337722"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;