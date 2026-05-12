import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyABICEFBgCXysNIq0Acq2wbBOa2ZPuMhwU",
  authDomain: "club-f60ed.firebaseapp.com",
  projectId: "club-f60ed",
  storageBucket: "club-f60ed.firebasestorage.app",
  messagingSenderId: "421399161160",
  appId: "1:421399161160:web:8a9376d796216bd111eb7d",
  measurementId: "G-2NQ0Q7KQTQ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account",
});