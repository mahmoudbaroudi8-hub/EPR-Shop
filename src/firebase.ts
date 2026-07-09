import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0488773877",
  appId: "1:128808253819:web:92a021005d39d4bb7be5de",
  apiKey: "AIzaSyBsMdGvGt2BZltrnl-fJP8XeogSQ5FgZPg",
  authDomain: "gen-lang-client-0488773877.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-tazajmartsuperma-2272b4d1-828e-49f9-9f10-cc470843d473",
  storageBucket: "gen-lang-client-0488773877.firebasestorage.app",
  messagingSenderId: "128808253819"
};

const app = initializeApp(firebaseConfig);

// Set up Auth
export const auth = getAuth(app);

// Set up Firestore with custom databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
