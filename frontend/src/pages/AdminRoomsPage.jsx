import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminRoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        room_type_id: '',
        room_number: '',
        status: 'available'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [roomsRes, roomTypesRes] = await Promise.all([
                axios.get('http://localhost:5001/api/admin/rooms', config),
                axios.get('http://localhost:5001/api/room-types')
            ]);

            setRooms(roomsRes.data);
            setRoomTypes(roomTypesRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
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

            if (editingRoom) {
                await axios.put(`http://localhost:5001/api/admin/rooms/${editingRoom.id}`, formData, config);
                alert('Room updated successfully');
            } else {
                await axios.post('http://localhost:5001/api/admin/rooms', formData, config);
                alert('Room created successfully');
            }

            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving room:', error);
            alert('Error saving room');
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            room_type_id: room.room_type_id,
            room_number: room.room_number,
            status: room.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this room?')) return;

        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.delete(`http://localhost:5001/api/admin/rooms/${id}`, config);
            alert('Room deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Error deleting room');
        }
    };

    const resetForm = () => {
        setFormData({
            room_type_id: '',
            room_number: '',
            status: 'available'
        });
        setEditingRoom(null);
    };

    const getStatusBadge = (status) => {
        const badges = {
            available: 'bg-green-100 text-green-800',
            occupied: 'bg-blue-100 text-blue-800',
            maintenance: 'bg-yellow-100 text-yellow-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading rooms...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Rooms</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    + Add Room
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rooms.length > 0 ? (
                            rooms.map((room) => (
                                <tr key={room.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {room.room_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {room.RoomType?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₱{room.RoomType?.base_price ? parseFloat(room.RoomType.base_price).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(room.status)}`}>
                                            {room.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => handleEdit(room)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No rooms found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingRoom ? 'Edit Room' : 'Add New Room'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Room Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.room_number}
                                        onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Room Type *
                                    </label>
                                    <select
                                        required
                                        value={formData.room_type_id}
                                        onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select a room type</option>
                                        {roomTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name} (₱{parseFloat(type.base_price).toLocaleString()})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="available">Available</option>
                                        <option value="occupied">Occupied</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
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
                                    {editingRoom ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminRoomsPage;
