import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth
} from "firebase/auth";

import { getFirestore } from "firebase/firestore"; // <-- Importa Firestore

// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCCaTDKSnhv4cj4c4b9SDqoPgjAoA12JT0",
  authDomain: "bolanarede-74738.firebaseapp.com",
  projectId: "bolanarede-74738",
  storageBucket: "bolanarede-74738.appspot.com",
  messagingSenderId: "67289384962",
  appId: "1:67289384962:web:d90b8878313d09ce18ff1b",
  measurementId: "G-GGWR796130"
};

// Inicializa app apenas uma vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializa auth (com persistência) apenas uma vez
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  auth = getAuth(app);
}

// Inicializa Firestore (Firestore não precisa de persistência específica aqui)
const db = getFirestore(app);

export { auth, db };
