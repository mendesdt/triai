import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDVC_vBZfeYtn3OpWyUd16Q5W1OU_v_Bvo",
  authDomain: "triai-dev-462420.firebaseapp.com",
  projectId: "triai-dev-462420",
  storageBucket: "triai-dev-462420.firebasestorage.app",
  messagingSenderId: "100869897469",
  appId: "1:100869897469:web:068846d40d2aa7fe959294"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);