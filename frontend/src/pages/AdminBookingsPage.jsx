import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('recent'); // 'recent' or 'older'
    const itemsPerPage = 10;

    useEffect(() => {
        fetchBookings();
    }, [sortOrder]);

    const fetchBookings = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.get('http://localhost:5001/api/admin/bookings', config);
            
            // Sort bookings by ID (most recent booking first)
            const sortedData = [...data].sort((a, b) => {
                return sortOrder === 'recent' ? b.id - a.id : a.id - b.id;
            });
            
            setBookings(sortedData);
            setCurrentPage(1); // Reset to first page when sorting changes
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

    const handleMarkPaid = async (bookingId) => {
        if (!confirm('Mark this booking as fully paid?')) return;

        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.put(
                `http://localhost:5001/api/admin/bookings/${bookingId}/mark-paid`,
                {},
                config
            );

            alert('Booking marked as paid');
            fetchBookings();
        } catch (error) {
            console.error('Error marking as paid:', error);
            alert(error.response?.data?.message || 'Error updating payment status');
        }
    };

    const handleRefund = async (bookingId) => {
        if (!confirm('Process refund for this cancelled booking? A confirmation email will be sent to the guest.')) return;

        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.put(
                `http://localhost:5001/api/admin/bookings/${bookingId}/refund`,
                {},
                config
            );

            alert('Refund processed successfully. Confirmation email sent to guest.');
            fetchBookings();
        } catch (error) {
            console.error('Error processing refund:', error);
            alert(error.response?.data?.message || 'Error processing refund');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            checked_in: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
            refunded: 'bg-purple-100 text-purple-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentBadge = (status) => {
        const badges = {
            unpaid: 'bg-red-100 text-red-800',
            partial: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            refunded: 'bg-purple-100 text-purple-800'
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

            {/* Filter Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Sort by:</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                        <option value="recent">Recent</option>
                        <option value="older">Older</option>
                    </select>
                    <span className="text-sm text-gray-500">
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, bookings.length)} - {Math.min(currentPage * itemsPerPage, bookings.length)} of {bookings.length} bookings
                    </span>
                </div>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance Due</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(() => {
                                const startIndex = (currentPage - 1) * itemsPerPage;
                                const endIndex = startIndex + itemsPerPage;
                                const currentBookings = bookings.slice(startIndex, endIndex);
                                
                                return currentBookings.length > 0 ? (
                                    currentBookings.map((booking) => (
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₱{parseFloat(booking.amount_paid || booking.total_price).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {booking.status === 'refunded' ? '—' : (booking.balance_due && parseFloat(booking.balance_due) > 0 ? `₱${parseFloat(booking.balance_due).toLocaleString()}` : '—')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadge(booking.payment_status)}`}>
                                                {booking.payment_status?.toUpperCase() || 'UNPAID'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {booking.payment_method ? (
                                                <span className={`font-medium ${booking.payment_method === 'paypal' ? 'text-blue-600' : 'text-blue-500'}`}>
                                                    {booking.payment_method === 'paypal' ? 'PayPal' : booking.payment_method === 'gcash' ? 'GCash' : booking.payment_method}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusBadge(booking.status)}`}
                                                disabled={booking.status === 'refunded'}
                                            >
                                                <option value="pending">PENDING</option>
                                                <option value="confirmed">CONFIRMED</option>
                                                <option value="checked_in">CHECKED IN</option>
                                                <option value="completed">COMPLETED</option>
                                                <option value="cancelled">CANCELLED</option>
                                                <option value="refunded">REFUNDED</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex flex-col gap-2">
                                                {booking.Invoice ? (
                                                    <button
                                                        onClick={() => window.location.href = `/admin/invoices/${booking.Invoice.id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        📄 View Invoice
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No Invoice</span>
                                                )}
                                                {(booking.payment_status === 'partial' || booking.payment_status === 'unpaid') && booking.status !== 'cancelled' && booking.status !== 'refunded' && (
                                                    <button
                                                        onClick={() => handleMarkPaid(booking.id)}
                                                        className="text-green-600 hover:text-green-900 font-medium"
                                                        title="Mark as Paid"
                                                    >
                                                        ✅ Mark Paid
                                                    </button>
                                                )}
                                                {booking.status === 'cancelled' && booking.payment_status !== 'refunded' && !booking.refunded && (booking.amount_paid > 0 || booking.payment_status !== 'unpaid') && (
                                                    <button
                                                        onClick={() => handleRefund(booking.id)}
                                                        className="text-orange-600 hover:text-orange-900 font-medium"
                                                        title="Process Refund"
                                                    >
                                                        💰 Refund
                                                    </button>
                                                )}
                                                {(booking.status === 'refunded' || booking.refunded || booking.payment_status === 'refunded') && (
                                                    <span className="text-green-600 text-xs font-medium">✓ Refunded</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                                        No bookings found
                                    </td>
                                </tr>
                            );
                            })()}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {bookings.length > itemsPerPage && (
                    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bookings.length / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(bookings.length / itemsPerPage)}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Page <span className="font-medium">{currentPage}</span> of{' '}
                                    <span className="font-medium">{Math.ceil(bookings.length / itemsPerPage)}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    {[...Array(Math.ceil(bookings.length / itemsPerPage))].map((_, idx) => (
                                        <button
                                            key={idx + 1}
                                            onClick={() => setCurrentPage(idx + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                currentPage === idx + 1
                                                    ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(bookings.length / itemsPerPage)))}
                                        disabled={currentPage === Math.ceil(bookings.length / itemsPerPage)}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminBookingsPage;
