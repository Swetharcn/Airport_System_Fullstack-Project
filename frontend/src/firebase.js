import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAa3_AywhjOaLxYwdJ7r9IWYNB-bjCkRS0",
  authDomain: "airassist-61c17.firebaseapp.com",
  projectId: "airassist-61c17",
  storageBucket: "airassist-61c17.firebasestorage.app",
  messagingSenderId: "801965788668",
  appId: "1:801965788668:web:d93eba94882ab1a0fe7679"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
