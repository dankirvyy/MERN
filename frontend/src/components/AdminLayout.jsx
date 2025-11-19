import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Manage Tours', path: '/admin/tours', icon: '🏝️' },
        { name: 'Manage Room Types', path: '/admin/room-types', icon: '🏷️' },
        { name: 'Manage Rooms', path: '/admin/rooms', icon: '🏨' },
        { name: 'Manage Bookings', path: '/admin/bookings', icon: '📅' },
        { name: 'Front Desk', path: '/admin/front-desk', icon: '🎯' },
        { name: 'Tour Bookings', path: '/admin/tour-bookings', icon: '🎫' },
        { name: 'Manage Resources', path: '/admin/resources', icon: '🚗' },
        { name: 'Manage Guests', path: '/admin/guests', icon: '👥' },
        { name: 'CRM Dashboard', path: '/admin/crm', icon: '📈' },
        { name: 'Reports', path: '/admin/reports', icon: '📋' },
        { name: 'Invoices & Billing', path: '/admin/invoices', icon: '💰' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 flex flex-col`}>
                {/* Logo/Header */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        {sidebarOpen && (
                            <h1 className="text-xl font-bold text-orange-500">Visit Mindoro</h1>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded hover:bg-gray-700"
                        >
                            {sidebarOpen ? '◀' : '▶'}
                        </button>
                    </div>
                    {sidebarOpen && (
                        <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {navigation.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-3 py-2 rounded-lg transition ${
                                        isActive(item.path)
                                            ? 'bg-orange-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                    title={!sidebarOpen ? item.name : ''}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    {sidebarOpen && (
                                        <span className="ml-3 text-sm font-medium">{item.name}</span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-gray-700">
                    {sidebarOpen && (
                        <div className="mb-3">
                            <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition"
                    >
                        <span className="text-xl">🚪</span>
                        {sidebarOpen && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white shadow-sm z-10">
                    <div className="px-6 py-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {navigation.find(item => item.path === location.pathname)?.name || 'Admin Panel'}
                        </h2>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
