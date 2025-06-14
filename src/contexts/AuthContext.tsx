import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(`Authentication error: ${error.message}`);
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;