
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewagent-ai.firebaseapp.com",
  projectId: "interviewagent-ai",
  storageBucket: "interviewagent-ai.firebasestorage.app",
  messagingSenderId: "143297804103",
  appId: "1:143297804103:web:f92ce9662fab09b342be62"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}