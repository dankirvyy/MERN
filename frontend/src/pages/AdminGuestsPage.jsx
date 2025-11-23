import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminGuestsPage = () => {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchGuests();
    }, []);

    const fetchGuests = async (searchTerm = '') => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: searchTerm ? { search: searchTerm } : {}
            };

            const { data } = await axios.get('http://localhost:5001/api/admin/guests', config);
            setGuests(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching guests:', error);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchGuests(search);
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.delete(`http://localhost:5001/api/admin/guests/${id}`, config);
            alert('Guest deleted successfully');
            fetchGuests(search);
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting guest');
        }
    };

    const getGuestTypeBadge = (type) => {
        const badges = {
            vip: 'bg-purple-100 text-purple-800',
            regular: 'bg-blue-100 text-blue-800',
            new: 'bg-gray-100 text-gray-800'
        };
        return badges[type] || badges.new;
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <p>Loading guests...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Search */}
            <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Search
                    </button>
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                fetchGuests('');
                            }}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </form>

            {/* Guests Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Guest
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Visits
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Revenue
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Visit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {guests.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    No guests found
                                </td>
                            </tr>
                        ) : (
                            guests.map((guest) => (
                                <tr key={guest.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {guest.avatar_filename ? (
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={`http://localhost:5001/uploads/avatars/${guest.avatar_filename}`}
                                                        alt={guest.first_name}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                                        {guest.first_name[0]}{guest.last_name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {guest.first_name} {guest.last_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {guest.phone_number || 'No phone'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {guest.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getGuestTypeBadge(guest.guest_type)}`}>
                                            {(guest.guest_type || 'new').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {guest.total_visits || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ₱{parseFloat(guest.total_revenue || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {guest.last_visit_date 
                                            ? new Date(guest.last_visit_date).toLocaleDateString()
                                            : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => navigate(`/admin/guests/${guest.id}`)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDelete(guest.id, `${guest.first_name} ${guest.last_name}`)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-6 bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600">
                    Showing <strong>{guests.length}</strong> guest(s)
                </p>
            </div>
        </AdminLayout>
    );
};

export default AdminGuestsPage;
