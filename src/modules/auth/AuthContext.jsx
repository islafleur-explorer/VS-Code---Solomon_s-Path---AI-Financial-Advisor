import { createContext, useState, useEffect, useContext } from 'react';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available to any child component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register a new user
  const register = (username, password) => {
    // In a real app, this would be an API call to create a user
    // For MVP, we'll just store in localStorage
    const newUser = { id: Date.now().toString(), username, password };
    localStorage.setItem('user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    return newUser;
  };

  // Login a user
  const login = (username, password) => {
    // In a real app, this would be an API call to validate credentials
    // For MVP, we'll just check localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.username === username && user.password === password) {
        setCurrentUser(user);
        return user;
      }
    }
    throw new Error('Invalid username or password');
  };

  // Logout a user
  const logout = () => {
    setCurrentUser(null);
    // In a real app, we might want to clear the token but keep the user data
    // For MVP, we'll just keep the user data in localStorage
  };

  // Value object that will be passed to consumers of this context
  const value = {
    currentUser,
    register,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
