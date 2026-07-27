import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Diagnostic connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful");
  } catch (error: any) {
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      console.log("Firestore initialized (Public connectivity check restricted)");
    } else if (error.message?.includes('offline') || error.code === 'unavailable') {
      console.warn("Firestore is unavailable. Please check internet connection.");
    } else {
      console.log("Firestore status:", error.message || error);
    }
  }
}

testConnection();

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
