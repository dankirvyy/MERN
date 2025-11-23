import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FrontDeskDashboardPage = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.get('http://localhost:5001/api/frontdesk/dashboard', config);
            setDashboardData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status === 403) {
                alert('Access denied. Front Desk role required.');
                navigate('/');
            }
            setLoading(false);
        }
    };

    const handleAssignRoom = (bookingId) => {
        navigate(`/frontdesk/assign/${bookingId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Visit Mindoro" className="h-8 w-8" />
                            <div>
                                <h1 className="text-2xl font-bold text-orange-600">Visit Mindoro</h1>
                                <p className="text-xs text-gray-600">Front Desk Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">Welcome, Front!</span>
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('token');
                                    sessionStorage.removeItem('user');
                                    navigate('/login');
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center gap-2"
                            >
                                <span>🚪</span> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Pending Assignments Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">⏰</span>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Pending Assignments</p>
                                <p className="text-3xl font-bold text-gray-900">{dashboardData?.unassignedBookings?.length || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Today's Check-ins Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🏨</span>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Today's Check-ins</p>
                                <p className="text-3xl font-bold text-gray-900">{dashboardData?.todaysCheckins?.length || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Today's Check-outs Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🏨</span>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Today's Check-outs</p>
                                <p className="text-3xl font-bold text-gray-900">{dashboardData?.todaysCheckouts?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Room Assignments */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-orange-600">🛏️</span> Pending Room Assignments
                        </h2>
                    </div>
                    <div className="p-6">
                        {dashboardData?.unassignedBookings?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData.unassignedBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {booking.Guest?.first_name} {booking.Guest?.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{booking.Guest?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {booking.RoomType?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(booking.check_in_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(booking.check_out_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    ₱{parseFloat(booking.total_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => handleAssignRoom(booking.id)}
                                                        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition"
                                                    >
                                                        Assign Room
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <span className="text-3xl">✓</span>
                                </div>
                                <p className="text-gray-600">All bookings have been assigned!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Today's Check-ins */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-green-600">📥</span> Today's Check-ins
                            </h2>
                        </div>
                        <div className="p-6">
                            {dashboardData?.todaysCheckins?.length > 0 ? (
                                <ul className="space-y-3">
                                    {dashboardData.todaysCheckins.map((booking) => (
                                        <li key={booking.id} className="border-l-4 border-green-500 bg-green-50 pl-4 py-3 rounded-r">
                                            <p className="font-semibold text-gray-900">
                                                {booking.Guest?.first_name} {booking.Guest?.last_name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Room: {booking.Room?.room_number || 'Not assigned'} - {booking.RoomType?.name || booking.Room?.RoomType?.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Time: {booking.check_in_time}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center py-12">No check-ins today</p>
                            )}
                        </div>
                    </div>

                    {/* Today's Check-outs */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-blue-600">📤</span> Today's Check-outs
                            </h2>
                        </div>
                        <div className="p-6">
                            {dashboardData?.todaysCheckouts?.length > 0 ? (
                                <ul className="space-y-3">
                                    {dashboardData.todaysCheckouts.map((booking) => (
                                        <li key={booking.id} className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 rounded-r">
                                            <p className="font-semibold text-gray-900">
                                                {booking.Guest?.first_name} {booking.Guest?.last_name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Room: {booking.Room?.room_number} - {booking.RoomType?.name || booking.Room?.RoomType?.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Time: {booking.check_out_time}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center py-12">No check-outs today</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FrontDeskDashboardPage;
