import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

/**
 * Auth Context
 * 
 * WHY THIS EXISTS:
 * Multiple components need to know "is the user logged in?" and "who is the user?"
 * Without context, you'd have to pass user data as props through every single component.
 * 
 * With context, ANY component anywhere in the app can do:
 *   const { user, isAuthenticated } = useAuth();
 * and instantly have access to the auth state.
 * 
 * HOW IT WORKS:
 * 1. When the app loads, check if there's an access token in localStorage
 * 2. If yes, call /api/auth/me to get the user's data
 * 3. Store user data in state
 * 4. Provide user, login, register, logout functions to all components
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking if user is already logged in

  // On app load: check if user is already authenticated
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      setUser(response.data.user);
    } catch {
      // Token is invalid or expired — clear it
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await authService.login(email, password);
    localStorage.setItem('accessToken', response.accessToken);
    setUser(response.data.user);
    return response;
  }

  async function register(name, email, password) {
    const response = await authService.register(name, email, password);
    localStorage.setItem('accessToken', response.accessToken);
    setUser(response.data.user);
    return response;
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // Even if the API call fails, clear local state
    }
    localStorage.removeItem('accessToken');
    setUser(null);
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — components use this instead of useContext directly
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
