import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firestore
export const db = getFirestore(app);