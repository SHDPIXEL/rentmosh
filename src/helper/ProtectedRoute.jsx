import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext'; // Update the path if necessary

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, isTokenExpired } = useContext(AuthContext);

  // Redirect to the homepage (or login page) if user is not authenticated or token is expired
  if (!isAuthenticated || isTokenExpired()) {
    return <Navigate to="/" />;
  }
  // Render the protected component
  return element;
};

export default ProtectedRoute;