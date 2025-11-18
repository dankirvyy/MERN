import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminCRMPage = () => {
    const [crmData, setCrmData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCRMData();
    }, []);

    const fetchCRMData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.get('http://localhost:5001/api/admin/crm', config);
            setCrmData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching CRM data:', error);
            setLoading(false);
        }
    };

    const handleExportMarketing = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            };

            const response = await axios.get('http://localhost:5001/api/admin/crm/export-marketing', config);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `marketing-list-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting marketing list:', error);
            alert('Error exporting marketing list');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading CRM data...</div>
            </AdminLayout>
        );
    }

    if (!crmData) {
        return (
            <AdminLayout>
                <div className="text-center py-12">No CRM data available</div>
            </AdminLayout>
        );
    }

    const getGuestTypeBadge = (type) => {
        const badges = {
            vip: 'bg-purple-100 text-purple-800',
            regular: 'bg-blue-100 text-blue-800',
            new: 'bg-gray-100 text-gray-800'
        };
        return badges[type] || badges.new;
    };

    return (
        <AdminLayout>
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium opacity-90">Total Guests</p>
                    <p className="text-3xl font-bold mt-2">{crmData.stats?.total_guests || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium opacity-90">VIP Guests</p>
                    <p className="text-3xl font-bold mt-2">{crmData.stats?.vip_count || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium opacity-90">Regular Guests</p>
                    <p className="text-3xl font-bold mt-2">{crmData.stats?.regular_count || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-6">
                    <p className="text-sm font-medium opacity-90">Total Revenue</p>
                    <p className="text-3xl font-bold mt-2">₱{parseFloat(crmData.stats?.total_revenue || 0).toLocaleString()}</p>
                </div>
            </div>

            {/* VIP Guests */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">VIP Guests</h2>
                    <span className="text-2xl">👑</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loyalty Points</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {crmData.vipGuests && crmData.vipGuests.length > 0 ? (
                                crmData.vipGuests.map((guest) => (
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
                                                        <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                                                            {guest.first_name?.[0]}{guest.last_name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {guest.first_name} {guest.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {guest.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {guest.total_visits || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₱{parseFloat(guest.total_revenue || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {guest.loyalty_points || 0}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No VIP guests yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Regular Guests */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Regular Guests</h2>
                    <span className="text-2xl">👥</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {crmData.regularGuests && crmData.regularGuests.length > 0 ? (
                                crmData.regularGuests.map((guest) => (
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
                                                            {guest.first_name?.[0]}{guest.last_name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {guest.first_name} {guest.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {guest.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {guest.total_visits || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₱{parseFloat(guest.total_revenue || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {guest.last_visit_date ? new Date(guest.last_visit_date).toLocaleDateString() : 'Never'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No regular guests yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Marketing Stats */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Marketing</h2>
                    <button
                        onClick={handleExportMarketing}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <span>📥</span>
                        Export List
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{crmData.stats?.marketing_subscribers || 0}</p>
                        <p className="text-sm text-gray-600">Subscribers</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-600">{(crmData.stats?.total_guests || 0) - (crmData.stats?.marketing_subscribers || 0)}</p>
                        <p className="text-sm text-gray-600">Non-Subscribers</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCRMPage;
