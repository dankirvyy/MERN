import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const ProtectedRoute = () => {
    const { user } = useAuth();

    // If user is logged in, show the child route (e.g., MyProfilePage)
    // Otherwise, redirect to login
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;