import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminRoomTypesPage = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoomType, setEditingRoomType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        base_price: '',
        capacity: ''
    });

    useEffect(() => {
        fetchRoomTypes();
    }, []);

    const fetchRoomTypes = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/room-types');
            setRoomTypes(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching room types:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            if (editingRoomType) {
                await axios.put(`http://localhost:5001/api/room-types/${editingRoomType.id}`, formData, config);
                alert('Room type updated successfully');
            } else {
                await axios.post('http://localhost:5001/api/room-types', formData, config);
                alert('Room type created successfully');
            }

            setShowModal(false);
            resetForm();
            fetchRoomTypes();
        } catch (error) {
            console.error('Error saving room type:', error);
            alert('Error saving room type');
        }
    };

    const handleEdit = (roomType) => {
        setEditingRoomType(roomType);
        setFormData({
            name: roomType.name,
            description: roomType.description || '',
            base_price: roomType.base_price,
            capacity: roomType.capacity
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this room type?')) return;

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.delete(`http://localhost:5001/api/room-types/${id}`, config);
            alert('Room type deleted successfully');
            fetchRoomTypes();
        } catch (error) {
            console.error('Error deleting room type:', error);
            alert('Error deleting room type');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            base_price: '',
            capacity: ''
        });
        setEditingRoomType(null);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading room types...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Room Types</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    + Add Room Type
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roomTypes.length > 0 ? (
                    roomTypes.map((roomType) => (
                        <div key={roomType.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{roomType.name}</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {roomType.description || 'No description'}
                                </p>
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Base Price:</span>
                                        <span className="font-semibold text-gray-900">
                                            ₱{parseFloat(roomType.base_price).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Capacity:</span>
                                        <span className="font-semibold text-gray-900">
                                            {roomType.capacity} guests
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(roomType)}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(roomType.id)}
                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-12 text-gray-500">
                        No room types found
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingRoomType ? 'Edit Room Type' : 'Add New Room Type'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Base Price *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.base_price}
                                        onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Capacity *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingRoomType ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminRoomTypesPage;
