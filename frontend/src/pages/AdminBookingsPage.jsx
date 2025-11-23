import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminBookingsPage = () => {
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

            const { data } = await axios.get('http://localhost:5001/api/admin/bookings', config);
            setBookings(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
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
                `http://localhost:5001/api/admin/bookings/${bookingId}/status`,
                { status: newStatus },
                config
            );

            fetchBookings();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating booking status');
        }
    };

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
                <div className="text-center py-12">Loading bookings...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Room Bookings</h1>
                <p className="text-gray-600 mt-1">Manage all room reservations</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                Room {booking.Room?.room_number}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {booking.Room?.RoomType?.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(booking.check_in_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(booking.check_out_date).toLocaleDateString()}
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
                                                <option value="checked_in">CHECKED IN</option>
                                                <option value="completed">COMPLETED</option>
                                                <option value="cancelled">CANCELLED</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => window.location.href = `/admin/guests/${booking.guest_id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                View Guest
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        No bookings found
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

export default AdminBookingsPage;
