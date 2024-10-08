import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";
// Firebase config
const firebaseConfig = {
  apiKey: "your key",
  authDomain: "expo-ddcae.firebaseapp.com",
  projectId: "expo-ddcae",
  storageBucket: "expo-ddcae.appspot.com",
  messagingSenderId: "285812471667",
  appId: "your id"
};

// initialize firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore(app);
export const storage = getStorage(app);