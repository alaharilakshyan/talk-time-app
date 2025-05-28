import React, { createContext, useContext, useState, useEffect } from 'react';

// Type definitions for TypeScript
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Create context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for accessing auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Main authentication provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management for user, token, and loading status
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Check localStorage for existing credentials
      const storedToken = localStorage.getItem('chat-token');
      const storedUser = localStorage.getItem('chat-user');
      
      if (storedToken && storedUser) {
        try {
          // Verify token validity with backend
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            // Valid token: set state with stored values
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Invalid token: clear storage
            logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      // Finish initial loading
      setLoading(false);
    };

    initializeAuth();
  }, []); // Empty dependency array = runs only once on mount

  // Handle successful authentication responses
  const handleAuthResponse = async (response: Response) => {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Authentication failed');
    }

    // Fetch complete user details after successful auth
    const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${data.token}`
      }
    });

    if (!userResponse.ok) throw new Error('Failed to fetch user details');
    
    // Update state and storage with new auth data
    const userData = await userResponse.json();
    localStorage.setItem('chat-token', data.token);
    localStorage.setItem('chat-user', JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      await handleAuthResponse(response);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false); // Always reset loading state
    }
  };

  // Register new user
  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      await handleAuthResponse(response);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear authentication state
  const logout = () => {
    setUser(null);
    setToken(null);
    // Remove stored credentials
    localStorage.removeItem('chat-token');
    localStorage.removeItem('chat-user');
  };

  // Provide context value to children
  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};