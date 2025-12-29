import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const loginWithGoogle = async () => {
    try {
      setAuthError('');
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error('Login error (redirect):', error);
      setAuthError(error?.message || 'Sign-in failed.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Handle redirect results if present
    getRedirectResult(auth)
      .then(() => {
        setAuthError('');
      })
      .catch((err) => {
        console.error('Redirect login error:', err);
        setAuthError(err?.message || 'Sign-in failed.');
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    logout,
    loading,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
