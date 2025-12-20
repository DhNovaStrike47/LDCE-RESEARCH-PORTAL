import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // OLD
  // const user = JSON.parse(localStorage.getItem('user'));

  // NEW
  const user = JSON.parse(sessionStorage.getItem('user'));

  // 2. If not logged in, go to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If logged in but wrong role (e.g., Student trying to access Principal page)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect them to their safe home page
    return <Navigate to="/" replace />;
  }

  // 4. If all good, show the page
  return children;
};

export default ProtectedRoute;