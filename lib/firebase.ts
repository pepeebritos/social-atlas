// lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAfrMuZ6PWPDOVEt4X2CeZ_uuhr-UBBtBg",
  authDomain: "thesocialatlas.firebaseapp.com",
  databaseURL: "https://thesocialatlas-default-rtdb.firebaseio.com",
  projectId: "thesocialatlas",
  storageBucket: "thesocialatlas.firebasestorage.app",
  messagingSenderId: "763193887700",
  appId: "1:763193887700:web:e8d82eec98bf4615db6441"
};

// Prevent Firebase from re-initializing during hot reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
