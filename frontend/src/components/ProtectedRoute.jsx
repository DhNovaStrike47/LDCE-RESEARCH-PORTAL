import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    // 1. Get user from Session Storage (Frontend way)
    const userString = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    // 2. If no data, force Login
    if (!token || !userString) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userString);

    // 3. Check Role Permission
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their Dashboard based on their actual role
        if(user.role === 'student') return <Navigate to="/StudentDashboard" replace />;
        if(user.role === 'faculty') return <Navigate to="/FacultyDashboard" replace />;
        if(user.role === 'principal' || user.role === 'admin') return <Navigate to="/Dashboard" replace />;
        
        return <Navigate to="/" replace />;
    }

    // 4. Access Granted
    return children;
};

export default ProtectedRoute;