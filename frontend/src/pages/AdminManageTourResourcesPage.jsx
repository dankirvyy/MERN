import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminManageTourResourcesPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [assignedResources, setAssignedResources] = useState([]);
    const [availableResources, setAvailableResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log('AdminManageTourResourcesPage - URL param id:', id);

    const fetchBookingDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No auth token found');
                setError('Authentication required. Please log in.');
                setLoading(false);
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            console.log('Fetching booking with ID:', id);
            console.log('API URL:', `http://localhost:5001/api/admin/tour-bookings/${id}`);
            
            const { data } = await axios.get(`http://localhost:5001/api/admin/tour-bookings/${id}`, config);
            console.log('Booking data received:', data);
            
            if (!data) {
                setError('Booking not found');
                setLoading(false);
                return;
            }
            
            setBooking(data);
            setError(null);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching booking:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            if (error.response?.status === 404) {
                setError('Booking not found. It may have been deleted.');
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                setError('Authentication error. Please log in as an admin.');
            } else {
                setError(error.response?.data?.message || 'Error loading booking details');
            }
            setLoading(false);
        }
    };

    const fetchAssignedResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            console.log('Fetching assigned resources for booking:', id);
            const { data } = await axios.get(`http://localhost:5001/api/admin/tour-bookings/${id}/resources`, config);
            console.log('Assigned resources raw data:', data);
            
            // Map the response to match expected format
            const formattedResources = data.map(schedule => ({
                schedule_id: schedule.id,
                name: schedule.Resource?.name || 'Unknown',
                type: schedule.Resource?.type || 'Unknown',
                start_time: schedule.start_time,
                end_time: schedule.end_time
            }));
            
            console.log('Formatted resources:', formattedResources);
            setAssignedResources(formattedResources);
        } catch (error) {
            console.error('Error fetching assigned resources:', error.response?.data || error.message);
            // Set empty array on error so page still loads
            setAssignedResources([]);
        }
    };

    const fetchAvailableResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            console.log('Fetching available resources');
            const { data } = await axios.get(`http://localhost:5001/api/admin/resources`, config);
            console.log('Available resources:', data);
            
            // Filter to only show available resources
            const available = data.filter(resource => resource.is_available);
            console.log('Filtered available resources:', available);
            setAvailableResources(available);
        } catch (error) {
            console.error('Error fetching available resources:', error.response?.data || error.message);
            // Set empty array on error so page still loads
            setAvailableResources([]);
        }
    };

    useEffect(() => {
        fetchBookingDetails();
        fetchAssignedResources();
        fetchAvailableResources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleAssignResource = async (e) => {
        e.preventDefault();
        
        if (!selectedResource) {
            alert('Please select a resource');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.post(
                `http://localhost:5001/api/admin/tour-bookings/${id}/resources`,
                {
                    resource_id: selectedResource,
                    start_time: '08:00:00',
                    end_time: '17:00:00'
                },
                config
            );

            setSelectedResource('');
            fetchAssignedResources();
            fetchAvailableResources();
            alert('Resource assigned successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error assigning resource');
        }
    };

    const handleUnassignResource = async (scheduleId) => {
        if (!confirm('Are you sure you want to un-assign this resource?')) return;

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.delete(
                `http://localhost:5001/api/admin/resource-schedules/${scheduleId}`,
                config
            );

            fetchAssignedResources();
            fetchAvailableResources();
            alert('Resource un-assigned successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error un-assigning resource');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading booking details...</div>
            </AdminLayout>
        );
    }

    if (!booking) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <p className="text-red-600">{error || 'Booking not found'}</p>
                    <button
                        onClick={() => navigate('/admin/tour-bookings')}
                        className="mt-4 text-orange-600 hover:text-orange-800"
                    >
                        ← Back to Tour Bookings
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/tour-bookings')}
                    className="text-sm font-medium text-gray-500 hover:text-orange-600 flex items-center mb-4"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Tour Bookings
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Manage Tour Booking</h1>
            </div>

            {/* Booking Details */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Booking #{booking.id} Details</h2>
                    <p className="mt-1 text-sm text-gray-500">Summary of the tour reservation.</p>
                </div>
                <div className="px-6 py-5">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Guest</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {booking.Guest?.first_name} {booking.Guest?.last_name}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Tour</dt>
                            <dd className="mt-1 text-sm text-gray-900">{booking.Tour?.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Tour Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {new Date(booking.booking_date).toLocaleDateString()}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Number of Guests</dt>
                            <dd className="mt-1 text-sm text-gray-900">{booking.number_of_pax}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900">{booking.status?.toUpperCase()}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                ₱{parseFloat(booking.total_price).toLocaleString()}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Assigned Resources */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Assigned Resources</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage guides, vehicles, or boats for this tour.</p>
                </div>

                <div className="border-t border-gray-200">
                    <ul role="list" className="divide-y divide-gray-200">
                        {assignedResources.length > 0 ? (
                            assignedResources.map((resource) => (
                                <li key={resource.schedule_id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                                        <p className="text-sm text-gray-500">{resource.type}</p>
                                    </div>
                                    <button
                                        onClick={() => handleUnassignResource(resource.schedule_id)}
                                        className="text-sm font-medium text-red-600 hover:text-red-800"
                                    >
                                        Un-assign
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-6 py-4">
                                <p className="text-sm text-gray-500">No resources assigned to this booking yet.</p>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Assign New Resource Form */}
                <div className="bg-gray-50 px-6 py-5 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Assign a New Resource</h3>
                    <form onSubmit={handleAssignResource} className="sm:flex sm:items-center">
                        <div className="w-full sm:max-w-xs">
                            <label htmlFor="resource" className="sr-only">Resource</label>
                            <select
                                id="resource"
                                value={selectedResource}
                                onChange={(e) => setSelectedResource(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                            >
                                <option value="">Select an available resource...</option>
                                {availableResources.map((resource) => (
                                    <option key={resource.id} value={resource.id}>
                                        {resource.name} ({resource.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 sm:mt-0 sm:ml-3 sm:w-auto"
                        >
                            Assign
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminManageTourResourcesPage;
