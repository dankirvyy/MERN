import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth.jsx';

// Helper to format currency
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(price);
};

// Helper to format text
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Helper to get status badge colors
const getStatusBadge = (status) => {
    const badges = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        checked_in: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
};

function MyProfilePage() {
    const { user } = useAuth();
    const [roomBookings, setRoomBookings] = useState([]);
    const [tourBookings, setTourBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleCancelRoomBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const token = JSON.parse(sessionStorage.getItem('user'))?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.patch(`http://localhost:5001/api/bookings/room/${bookingId}/cancel`, {}, config);
            
            // Refresh bookings
            setRoomBookings(prev => prev.map(b => 
                b.id === bookingId ? { ...b, status: 'cancelled' } : b
            ));
            
            alert('Booking cancelled successfully');
        } catch (err) {
            console.error('Cancel booking error:', err);
            alert('Failed to cancel booking. Please try again.');
        }
    };

    const handleCancelTourBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const token = JSON.parse(sessionStorage.getItem('user'))?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.patch(`http://localhost:5001/api/bookings/tour/${bookingId}/cancel`, {}, config);
            
            // Refresh bookings
            setTourBookings(prev => prev.map(b => 
                b.id === bookingId ? { ...b, status: 'cancelled' } : b
            ));
            
            alert('Booking cancelled successfully');
        } catch (err) {
            console.error('Cancel booking error:', err);
            alert('Failed to cancel booking. Please try again.');
        }
    };

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                // Get token from localStorage
                const token = JSON.parse(sessionStorage.getItem('user'))?.token;

                if (!token) {
                    setError('Not authorized.');
                    setLoading(false);
                    return;
                }
                
                // Create auth headers
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                
                // Make both API calls
                const [roomsRes, toursRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/bookings/my-rooms', config),
                    axios.get('http://localhost:5001/api/bookings/my-tours', config)
                ]);

                setRoomBookings(roomsRes.data);
                setTourBookings(toursRes.data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch bookings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBookings();
        }
    }, [user]);

    const getAvatarUrl = () => {
        if (user && user.avatar_filename) {
            return `http://localhost:5001/uploads/avatars/${user.avatar_filename}`;
        }
        return 'https://via.placeholder.com/100/cccccc/888888?text=No+Avatar';
    };

    if (!user) {
        return <div>Loading user...</div>; // Or redirect
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

            {/* We'll add success/error flash messages later */}

            <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-8">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Your contact details.</p>
                    </div>
                    <Link to="/edit-profile" className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50">
                        Edit Profile
                    </Link>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="flex items-center space-x-4">
                        <img className="h-24 w-24 rounded-full object-cover" src={getAvatarUrl()} alt="Profile Picture" />
                        <dl className="flex-1 sm:divide-y sm:divide-gray-200">
                            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
                            </div>
                            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                            </div>
                            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.phone_number || 'Not provided'}</dd>
                            </div>
                            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">Avatar</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <Link to="/change-avatar" className="text-orange-600 hover:text-orange-800">Change Avatar</Link>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Reservations</h2>

            {loading ? (
                <div>Loading bookings...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <>
                    {/* Room Bookings */}
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-8">
                        <div className="px-4 py-5 sm:px-6"><h3 className="text-lg font-medium text-gray-900">Room Bookings</h3></div>
                        <div className="border-t border-gray-200">
                            {roomBookings.length === 0 ? (
                                <p className="text-center text-gray-500 py-6 px-6">You have no room bookings.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in / Check-out</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {roomBookings.map(b => (
                                                <tr key={b.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.room_number ? `${b.room_number} (${b.room_type_name})` : `Not Assigned Yet (${b.room_type_name})`}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.check_in_date} to {b.check_out_date}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(b.status)}`}>
                                                            {capitalize(b.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(b.total_price)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {b.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleCancelRoomBooking(b.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tour Bookings */}
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6"><h3 className="text-lg font-medium text-gray-900">Tour Bookings</h3></div>
                        <div className="border-t border-gray-200">
                            {tourBookings.length === 0 ? (
                                <p className="text-center text-gray-500 py-6 px-6">You have no tour bookings.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {tourBookings.map(b => (
                                                <tr key={b.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.tour_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.booking_date}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.number_of_pax}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(b.status)}`}>
                                                            {capitalize(b.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(b.total_price)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {b.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleCancelTourBooking(b.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default MyProfilePage;