import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
});

export const useAuth = () => useContext(AuthContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let docUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (docUnsub) {
        docUnsub();
        docUnsub = null;
      }

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const profileDoc = await getDoc(userDocRef);
          
          if (!profileDoc.exists()) {
            const newProfile = {
              uid: user.uid,
              email: user.email || 'user@skillx.ai',
              name: user.displayName || user.email?.split('@')[0] || 'Learner',
              role: 'Full-Stack Software Engineer',
              plan: 'Free',
              credits: 1000,
              photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          } else {
            const data = profileDoc.data();
            if (!data.photoURL && user.photoURL) {
              data.photoURL = user.photoURL;
            } else if (!data.photoURL) {
              data.photoURL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
            }
            setProfile(data);
          }

          // Realtime updates
          docUnsub = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (!data.photoURL) {
                data.photoURL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
              }
              setProfile(data);
            }
          });
        } catch (err) {
          console.warn("Could not fetch user profile from Firestore:", err);
          setProfile({
            uid: user.uid,
            email: user.email || 'user@skillx.ai',
            name: user.displayName || user.email?.split('@')[0] || 'Learner',
            role: 'Full-Stack Software Engineer',
            plan: 'Free',
            credits: 1000,
            photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => {
      authUnsub();
      if (docUnsub) docUnsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};
