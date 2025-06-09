import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyADkeWH0GebbMem-wK2jNGLW673FYd408c",
  authDomain: "triai-dev.firebaseapp.com",
  projectId: "triai-dev",
  storageBucket: "triai-dev.firebasestorage.app",
  messagingSenderId: "970396293682",
  appId: "1:970396293682:web:f8d7c3d3bb2218c9db7a2b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;