import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminGuestDetailPage = () => {
    const { id } = useParams();
    const [guestData, setGuestData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchGuestDetail = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await axios.get(`http://localhost:5001/api/admin/guests/${id}`, config);
            setGuestData(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching guest details:', err);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchGuestDetail();
    }, [fetchGuestDetail]);

    const handleRefreshMetrics = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.post(`http://localhost:5001/api/admin/guests/${id}/refresh-metrics`, {}, config);
            alert('Guest metrics refreshed successfully');
            fetchGuestDetail();
        } catch (err) {
            console.error('Error refreshing metrics:', err);
            alert('Error refreshing metrics');
        }
    };

    if (loading) {
        return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
    }

    if (!guestData) {
        return <div className="container mx-auto px-4 py-12 text-center">Guest not found</div>;
    }

    const { guest, roomBookings, tourBookings } = guestData;

    return (
        <AdminLayout>
            {/* Guest Info */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex items-start gap-6">
                    <div className="h-24 w-24 flex-shrink-0">
                        {guest.avatar_filename ? (
                                <img
                                    className="h-24 w-24 rounded-full object-cover"
                                    src={`http://localhost:5001/uploads/avatars/${guest.avatar_filename}`}
                                    alt={guest.first_name}
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                                    {guest.first_name[0]}{guest.last_name[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {guest.first_name} {guest.last_name}
                            </h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Email:</span>
                                    <span className="ml-2 font-medium">{guest.email}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="ml-2 font-medium">{guest.phone_number || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Type:</span>
                                    <span className="ml-2 font-medium uppercase">{guest.guest_type || 'NEW'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Total Visits:</span>
                                    <span className="ml-2 font-medium">{guest.total_visits || 0}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Total Revenue:</span>
                                    <span className="ml-2 font-medium">₱{parseFloat(guest.total_revenue || 0).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Loyalty Points:</span>
                                    <span className="ml-2 font-medium">{guest.loyalty_points || 0}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleRefreshMetrics}
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Refresh Metrics
                            </button>
                        </div>
                    </div>
                </div>

                {/* Room Bookings */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="text-xl font-bold mb-4">Room Bookings</h3>
                    {roomBookings.length === 0 ? (
                        <p className="text-gray-500">No room bookings</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {roomBookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4">{booking.Room?.RoomType?.name} - {booking.Room?.room_number}</td>
                                            <td className="px-6 py-4">{new Date(booking.check_in_date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{new Date(booking.check_out_date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">₱{parseFloat(booking.total_price).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Tour Bookings */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">Tour Bookings</h3>
                    {tourBookings.length === 0 ? (
                        <p className="text-gray-500">No tour bookings</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pax</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {tourBookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4">{booking.Tour?.name}</td>
                                            <td className="px-6 py-4">{new Date(booking.booking_date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{booking.number_of_pax}</td>
                                            <td className="px-6 py-4">₱{parseFloat(booking.total_price).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
        </AdminLayout>
    );
};

export default AdminGuestDetailPage;
