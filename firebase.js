import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCH4tH1mNJdqFUQ4fQTLS42ZRc87gxr6og",
  authDomain: "backpackingatlas.firebaseapp.com",
  databaseURL: "https://backpackingatlas-default-rtdb.firebaseio.com",
  projectId: "backpackingatlas",
  storageBucket: "backpackingatlas.firebasestorage.app",
  messagingSenderId: "261591608715",
  appId: "1:261591608715:web:03130e349a342c7252d38e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

