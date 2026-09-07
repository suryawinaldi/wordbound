import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBBB6Z6Jjm0v8Lfx3rNdqIzgdXjOWes-f4',
  authDomain: 'learningenglish-suryaalmira.firebaseapp.com',
  projectId: 'learningenglish-suryaalmira',
  storageBucket: 'learningenglish-suryaalmira.firebasestorage.app',
  messagingSenderId: '740908398240',
  appId: '1:740908398240:web:198f10fc5fa6cd583bbbc5',
  measurementId: 'G-57FKY4SCXR',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export default app
