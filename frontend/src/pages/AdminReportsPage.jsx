import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminReportsPage = () => {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { start_date: startDate, end_date: endDate }
            };

            const { data } = await axios.get('http://localhost:5001/api/admin/reports', config);
            setReports(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleFilter = (e) => {
        e.preventDefault();
        fetchReports();
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading reports...</div>
            </AdminLayout>
        );
    }

    if (!reports) {
        return (
            <AdminLayout>
                <div className="text-center py-12">No report data available</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                    >
                        Apply Filter
                    </button>
                </form>
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Room Revenue</p>
                            <p className="text-3xl font-bold text-gray-900">₱{reports.room_revenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-3">
                            <span className="text-2xl">🏨</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tour Revenue</p>
                            <p className="text-3xl font-bold text-gray-900">₱{reports.tour_revenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-100 rounded-full p-3">
                            <span className="text-2xl">🏝️</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-3xl font-bold text-orange-600">₱{reports.total_revenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-orange-100 rounded-full p-3">
                            <span className="text-2xl">💰</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Statistics */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{reports.booking_stats.total_bookings || 0}</p>
                        <p className="text-sm text-gray-600">Total Bookings</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{reports.booking_stats.confirmed || 0}</p>
                        <p className="text-sm text-gray-600">Confirmed</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{reports.booking_stats.completed || 0}</p>
                        <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{reports.booking_stats.cancelled || 0}</p>
                        <p className="text-sm text-gray-600">Cancelled</p>
                    </div>
                </div>
            </div>

            {/* Popular Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Popular Room Types */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Most Popular Room Types</h2>
                    {reports.popular_rooms && reports.popular_rooms.length > 0 ? (
                        <div className="space-y-3">
                            {reports.popular_rooms.map((room, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="font-semibold text-gray-900">{room.Room?.RoomType?.name || 'N/A'}</p>
                                        <p className="text-sm text-gray-500">{room.booking_count} bookings</p>
                                    </div>
                                    <p className="font-bold text-orange-600">₱{parseFloat(room.revenue || 0).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No data available for this period</p>
                    )}
                </div>

                {/* Popular Tours */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Most Popular Tours</h2>
                    {reports.popular_tours && reports.popular_tours.length > 0 ? (
                        <div className="space-y-3">
                            {reports.popular_tours.map((tour, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="font-semibold text-gray-900">{tour.Tour?.name || 'N/A'}</p>
                                        <p className="text-sm text-gray-500">{tour.booking_count} bookings</p>
                                    </div>
                                    <p className="font-bold text-orange-600">₱{parseFloat(tour.revenue || 0).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No data available for this period</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminReportsPage;
