import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role-based access control
    const path = location.pathname;
    
    // Admin routes - only for admin role
    if (path.startsWith('/admin') && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    
    // Front Desk routes - only for front_desk role
    if (path.startsWith('/frontdesk') && user.role !== 'front_desk') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;