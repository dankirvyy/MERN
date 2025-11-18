import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminResourceCalendarPage = () => {
    const navigate = useNavigate();
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];

    useEffect(() => {
        fetchCalendarData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedType, selectedMonth, selectedYear]);

    const fetchCalendarData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    type: selectedType,
                    month: selectedMonth,
                    year: selectedYear
                }
            };

            const { data } = await axios.get('http://localhost:5001/api/admin/resources/calendar', config);
            setCalendarData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            setLoading(false);
        }
    };

    const changeMonth = (delta) => {
        let newMonth = selectedMonth + delta;
        let newYear = selectedYear;

        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }

        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    const goToToday = () => {
        setSelectedMonth(new Date().getMonth() + 1);
        setSelectedYear(new Date().getFullYear());
    };

    const showEventDetails = (event) => {
        setSelectedEvent(event);
        setShowModal(true);
    };

    const getResourceTypeColor = (type) => {
        const colors = {
            'Guide': 'bg-blue-500',
            'Vehicle': 'bg-green-500',
            'Boat': 'bg-cyan-500',
            'Equipment': 'bg-purple-500',
            'guide': 'bg-blue-500',
            'vehicle': 'bg-green-500',
            'boat': 'bg-cyan-500',
            'equipment': 'bg-purple-500'
        };
        return colors[type] || 'bg-gray-500';
    };

    const getResourceTypeIcon = (type) => {
        const icons = {
            'Guide': '👤',
            'Vehicle': '🚗',
            'Boat': '⛵',
            'Equipment': '🛠️',
            'guide': '👤',
            'vehicle': '🚗',
            'boat': '⛵',
            'equipment': '🛠️'
        };
        return icons[type] || '📦';
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading calendar...</div>
            </AdminLayout>
        );
    }

    const stats = calendarData?.stats || {};
    const calendarDays = calendarData?.calendar_days || [];
    const resources = calendarData?.resources || [];

    return (
        <AdminLayout>
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Resource Scheduling</h1>
                        <p className="text-lg text-gray-500">View and manage resource availability and assignments</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/resources')}
                        className="text-orange-600 hover:text-orange-800 flex items-center gap-2"
                    >
                        ← Back to Resources
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        >
                            <option value="">All Resources</option>
                            <option value="Guide">Guides</option>
                            <option value="Vehicle">Vehicles</option>
                            <option value="Boat">Boats</option>
                            <option value="Equipment">Equipment</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        >
                            {monthNames.map((month, index) => (
                                <option key={index} value={index + 1}>{month}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        >
                            {[...Array(5)].map((_, i) => {
                                const year = new Date().getFullYear() - 1 + i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Available Resources</p>
                            <p className="text-3xl font-semibold text-gray-900">{stats.available || 0}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <span className="text-2xl">✓</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Resources</p>
                            <p className="text-3xl font-semibold text-gray-900">{stats.total || 0}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <span className="text-2xl">📦</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Scheduled This Month</p>
                            <p className="text-3xl font-semibold text-gray-900">{stats.scheduled_month || 0}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <span className="text-2xl">📅</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Utilization Rate</p>
                            <p className="text-3xl font-semibold text-gray-900">{Math.round(stats.utilization || 0)}%</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                            <span className="text-2xl">📊</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {monthNames[selectedMonth - 1]} {selectedYear}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => changeMonth(1)}
                            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Next →
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-7 gap-px bg-gray-200">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-gray-50 p-3 text-center font-semibold text-sm text-gray-600">
                                {day}
                            </div>
                        ))}
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                className={`bg-white min-h-[100px] p-2 ${
                                    day.is_today ? 'bg-yellow-50' : ''
                                } ${day.is_other_month ? 'bg-gray-50 opacity-50' : ''}`}
                            >
                                <div className="font-semibold text-gray-900 mb-1">{day.day}</div>
                                <div className="space-y-1">
                                    {day.schedules && day.schedules.map((schedule, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => showEventDetails(schedule)}
                                            className={`${getResourceTypeColor(schedule.resource_type)} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80 flex items-center gap-1`}
                                        >
                                            <span>{getResourceTypeIcon(schedule.resource_type)}</span>
                                            <span className="truncate">{schedule.resource_name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Resources Table */}
            <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-5 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">All Resources</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase">Resource</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase">Capacity</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase">Next Booking</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase">Utilization</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {resources.length > 0 ? (
                                resources.map((resource) => (
                                    <tr key={resource.id} className="hover:bg-orange-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {resource.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {resource.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {resource.capacity || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {resource.is_available ? (
                                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                    ✓ Available
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                    ✗ Unavailable
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {resource.next_booking || 'No upcoming bookings'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-orange-600 h-2.5 rounded-full"
                                                        style={{ width: `${resource.utilization || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                                                    {Math.round(resource.utilization || 0)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No resources found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Event Details Modal */}
            {showModal && selectedEvent && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-xl p-8 max-w-lg w-full m-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Schedule Details</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Resource</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <span>{getResourceTypeIcon(selectedEvent.resource_type)}</span>
                                    {selectedEvent.resource_name}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tour</p>
                                    <p className="mt-1 font-medium text-gray-800">{selectedEvent.tour_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Guest</p>
                                    <p className="mt-1 font-medium text-gray-800">{selectedEvent.guest_name}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                                <p className="mt-1 font-medium text-gray-800">
                                    {new Date(selectedEvent.booking_date).toLocaleDateString()}
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                    {selectedEvent.start_time} - {selectedEvent.end_time}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <p className="mt-1 font-medium text-gray-800 capitalize">{selectedEvent.status}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminResourceCalendarPage;
