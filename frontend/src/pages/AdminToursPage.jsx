import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminToursPage = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTour, setEditingTour] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        latitude: '',
        longitude: '',
        is_active: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/tours');
            setTours(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tours:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('duration', formData.duration);
            formDataToSend.append('latitude', formData.latitude);
            formDataToSend.append('longitude', formData.longitude);
            formDataToSend.append('is_active', formData.is_active);
            
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const config = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingTour) {
                await axios.put(`http://localhost:5001/api/tours/${editingTour.id}`, formDataToSend, config);
                alert('Tour updated successfully');
            } else {
                await axios.post('http://localhost:5001/api/tours', formDataToSend, config);
                alert('Tour created successfully');
            }

            setShowModal(false);
            resetForm();
            fetchTours();
        } catch (error) {
            console.error('Error saving tour:', error);
            alert('Error saving tour');
        }
    };

    const handleEdit = (tour) => {
        setEditingTour(tour);
        setFormData({
            name: tour.name,
            description: tour.description || '',
            price: tour.price,
            duration: tour.duration || '',
            latitude: tour.latitude || '',
            longitude: tour.longitude || '',
            is_active: tour.is_active
        });
        if (tour.image_filename) {
            setImagePreview(`http://localhost:5001/uploads/${tour.image_filename}`);
        }
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tour?')) return;

        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.delete(`http://localhost:5001/api/tours/${id}`, config);
            alert('Tour deleted successfully');
            fetchTours();
        } catch (error) {
            console.error('Error deleting tour:', error);
            alert('Error deleting tour');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            duration: '',
            latitude: '',
            longitude: '',
            is_active: true
        });
        setEditingTour(null);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading tours...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Tours</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    + Add Tour
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tours.length > 0 ? (
                            tours.map((tour) => (
                                <tr key={tour.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {tour.image_filename ? (
                                            <img
                                                src={`http://localhost:5001/uploads/${tour.image_filename}`}
                                                alt={tour.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                                No image
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {tour.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {tour.description ? tour.description.substring(0, 50) + '...' : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₱{parseFloat(tour.price).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tour.duration || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            tour.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {tour.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => handleEdit(tour)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tour.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    No tours found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingTour ? 'Edit Tour' : 'Add New Tour'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tour Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-2">
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
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 3 hours"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="0.00000001"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="0.00000001"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tour Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    {imagePreview && (
                                        <div className="mt-3">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active</span>
                                    </label>
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
                                    {editingTour ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminToursPage;
