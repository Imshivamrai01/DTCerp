import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIRE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIRE_AUTH_DOM,
  // databaseURL: process.env.NEXT_PUBLIC_FIRE_DB_URL,
  projectId: process.env.NEXT_PUBLIC_FIRE_PRJ_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIRE_STG_BKT,
  messagingSenderId: process.env.NEXT_PUBLIC_FIRE_MSG_ID,
  appId: process.env.NEXT_PUBLIC_FIRE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIRE_MES_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
