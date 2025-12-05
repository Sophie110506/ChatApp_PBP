import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  connectStorageEmulator
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAsYW1qwx-zZQ-2_-FFRqI7-fOraExHpKk",
  authDomain: "chatapp-49efa.firebaseapp.com",
  projectId: "chatapp-49efa",
  storageBucket: "chatapp-49efa.appspot.com",
  messagingSenderId: "338604421982",
  appId: "1:338604421982:web:72cdbe749dc6a86360d5cf",
  measurementId: "G-371PPQGG5D"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ FIX: Tambahkan messagesCollection BIAR TIDAK UNDEFINED
export const messagesCollection = collection(db, "messages");

// Opsional: Emulator Storage
if (__DEV__) {
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  console.log('🔥 Firebase Storage Emulator connected at 127.0.0.1:9199');
}

// Export lain
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  ref,
  uploadBytes,
  getDownloadURL
};
