import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminResourcesPage = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        capacity: '',
        is_available: true
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.get('http://localhost:5001/api/admin/resources', config);
            setResources(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching resources:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            if (editingResource) {
                await axios.put(`http://localhost:5001/api/admin/resources/${editingResource.id}`, formData, config);
                alert('Resource updated successfully');
            } else {
                await axios.post('http://localhost:5001/api/admin/resources', formData, config);
                alert('Resource created successfully');
            }

            setShowModal(false);
            setEditingResource(null);
            setFormData({ name: '', type: '', capacity: '', is_available: true });
            fetchResources();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving resource');
        }
    };

    const handleEdit = (resource) => {
        setEditingResource(resource);
        setFormData({
            name: resource.name,
            type: resource.type,
            capacity: resource.capacity || '',
            is_available: resource.is_available
        });
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.delete(`http://localhost:5001/api/admin/resources/${id}`, config);
            alert('Resource deleted successfully');
            fetchResources();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting resource');
        }
    };

    const handleAdd = () => {
        setEditingResource(null);
        setFormData({ name: '', type: '', capacity: '', is_available: true });
        setShowModal(true);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading resources...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Add Resource and View Calendar Buttons */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/admin/resources/calendar')}
                    className="bg-white text-orange-600 border border-orange-600 px-6 py-2 rounded-lg hover:bg-orange-50 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    View Calendar
                </button>
                <button
                    onClick={handleAdd}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                >
                    Add New Resource
                </button>
            </div>

            {/* Resources Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Resources (Guides, Vehicles, Boats, etc.)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {resources.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No resources found
                                    </td>
                                </tr>
                            ) : (
                                resources.map((resource) => (
                                    <tr key={resource.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {resource.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {resource.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {resource.capacity || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {resource.is_available ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                    Available
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                    Unavailable
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(resource)}
                                                className="text-orange-600 hover:text-orange-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(resource.id, resource.name)}
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
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-xl p-8 m-4 max-w-lg w-full">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingResource ? 'Edit Resource' : 'Add New Resource'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                    placeholder="e.g., Tour Guide John"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Select type...</option>
                                    <option value="guide">Tour Guide</option>
                                    <option value="vehicle">Vehicle</option>
                                    <option value="boat">Boat</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (Optional)</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                    placeholder="Maximum capacity"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_available"
                                    checked={formData.is_available}
                                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                                    Available
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingResource(null);
                                        setFormData({ name: '', type: '', capacity: '', is_available: true });
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                >
                                    {editingResource ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminResourcesPage;
