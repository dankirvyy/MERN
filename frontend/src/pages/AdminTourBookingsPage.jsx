import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminTourBookingsPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.get('http://localhost:5001/api/admin/tour-bookings', config);
            setBookings(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tour bookings:', error);
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.put(
                `http://localhost:5001/api/admin/tour-bookings/${bookingId}/status`,
                { status: newStatus },
                config
            );

            fetchBookings();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating booking status');
        }
    };

    const handleConfirmBooking = async (bookingId) => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.patch(
                `http://localhost:5001/api/admin/tour-bookings/${bookingId}/confirm`,
                {},
                config
            );

            fetchBookings();
            alert('Tour booking confirmed successfully!');
        } catch (error) {
            console.error('Error confirming booking:', error);
            alert(error.response?.data?.message || 'Error confirming booking');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentBadge = (status) => {
        const badges = {
            unpaid: 'bg-red-100 text-red-800',
            partial: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading tour bookings...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Tour Bookings</h1>
                <p className="text-gray-600 mt-1">Manage all tour reservations</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pax</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {booking.Guest?.first_name} {booking.Guest?.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {booking.Guest?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {booking.Tour?.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ₱{booking.Tour?.price ? parseFloat(booking.Tour.price).toLocaleString() : 'N/A'} per person
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(booking.booking_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {booking.number_of_pax} pax
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₱{parseFloat(booking.total_price).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadge(booking.payment_status)}`}>
                                                {booking.payment_status?.toUpperCase() || 'UNPAID'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusBadge(booking.status)}`}
                                            >
                                                <option value="pending">PENDING</option>
                                                <option value="confirmed">CONFIRMED</option>
                                                <option value="completed">COMPLETED</option>
                                                <option value="cancelled">CANCELLED</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex flex-col gap-2">
                                                {booking.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleConfirmBooking(booking.id)}
                                                        className="text-green-600 hover:text-green-900 font-medium"
                                                    >
                                                        Confirm Booking
                                                    </button>
                                                )}
                                                {booking.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => navigate(`/admin/tour-bookings/${booking.id}/manage-resources`)}
                                                        className="text-orange-600 hover:text-orange-900 font-medium"
                                                    >
                                                        Manage Resources
                                                    </button>
                                                )}
                                                {booking.status === 'cancelled' && (
                                                    <span className="text-gray-400 text-xs">Cancelled</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        No tour bookings found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminTourBookingsPage;
