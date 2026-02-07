import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Safely retrieve environment variables
const getEnvVar = (key: string): string => {
  try {
    // @ts-ignore
    return (import.meta.env && import.meta.env[key]) ? import.meta.env[key] : "";
  } catch (e) {
    return "";
  }
};

const firebaseConfig = {
  // Use env var or fall back to the provided key
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || "BGmfIi-aejAQWMsRAFGTEyvlgDAjFx0do2kvfOrzo4Lmwkrs8E_uzmXV6Tf8GA5fq9KTgZuDQYIEqDcRvvDKm1k",
  
  // Construct auth domain from project ID if missing
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || "mooderia-61520.firebaseapp.com",
  
  // Explicitly set the database URL for the project
  databaseURL: getEnvVar('VITE_FIREBASE_DATABASE_URL') || "https://mooderia-61520-default-rtdb.firebaseio.com/",
  
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || "mooderia-61520",
  
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || "mooderia-61520.appspot.com",
  
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || "194631322238",
  
  appId: getEnvVar('VITE_FIREBASE_APP_ID') || '1:194631322238:web:1eae704b476578a725662f'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);