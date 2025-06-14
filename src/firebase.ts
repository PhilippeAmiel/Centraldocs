// Firebase configuration - simplified and robust
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Direct configuration to avoid environment variable issues
const firebaseConfig = {
  apiKey: "AIzaSyAbHhGjL9KYlURcBauxjh9FXTxjnO_KYDE",
  authDomain: "centraldocs-616b8.firebaseapp.com",
  projectId: "centraldocs-616b8",
  storageBucket: "centraldocs-616b8.firebasestorage.app",
  messagingSenderId: "838208017668",
  appId: "1:838208017668:web:1a5837c138b50592feec51",
  measurementId: "G-LZ53BYV2LW"
};

console.log('Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log('Firebase initialized successfully');

export { auth, db, storage };