import React, { createContext, useState, useEffect } from 'react';

// Create a Context for authentication
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to check if token is expired
  const isTokenExpired = () => {
    const token = localStorage.getItem('authToken');
    const expiration = localStorage.getItem('tokenExpiration');
    if (!token || !expiration) return true;  // Return true if there's no token or expiration data
    return Date.now() > parseInt(expiration);  // Compare current time with expiration
  };

  // Set token and expiration
  const login = (token, type) => {
    const expirationTime = Date.now() + 3600000; // 1 hour from now
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    localStorage.setItem('type', type);
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  //for signup
  const signup = (token, type) => {
    const expirationTime = Date.now() + 3600000; // 1 hour from now
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    localStorage.setItem('type', type);
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  // Check if the user is authenticated on component mount
  useEffect(() => {
    if (isTokenExpired()) {
      logout();
    } else {
      const token = localStorage.getItem('authToken');
      if (token) {
        setAuthToken(token);
        setIsAuthenticated(true);
      }
    }
  }, []);  // Empty dependency array ensures this only runs once after initial render
  

  return (
    <AuthContext.Provider value={{ authToken, isAuthenticated, login, signup, logout, isTokenExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };