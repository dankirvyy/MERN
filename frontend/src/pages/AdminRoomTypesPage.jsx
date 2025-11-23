import { useState, useEffect, useRef } from 'react';
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
        capacity: '',
        location: '',
        latitude: '',
        longitude: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

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
            const token = sessionStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('base_price', formData.base_price);
            formDataToSend.append('capacity', formData.capacity);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('latitude', formData.latitude);
            formDataToSend.append('longitude', formData.longitude);
            
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const config = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingRoomType) {
                await axios.put(`http://localhost:5001/api/room-types/${editingRoomType.id}`, formDataToSend, config);
                alert('Room type updated successfully');
            } else {
                await axios.post('http://localhost:5001/api/room-types', formDataToSend, config);
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
            capacity: roomType.capacity,
            location: roomType.location || '',
            latitude: roomType.latitude || '',
            longitude: roomType.longitude || ''
        });
        if (roomType.image_filename) {
            setImagePreview(`http://localhost:5001/uploads/${roomType.image_filename}`);
        }
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this room type?')) return;

        try {
            const token = sessionStorage.getItem('token');
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
            capacity: '',
            location: '',
            latitude: '',
            longitude: ''
        });
        setEditingRoomType(null);
        setImageFile(null);
        setImagePreview(null);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
        if (markerRef.current) {
            markerRef.current = null;
        }
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

    // Initialize map when modal opens
    useEffect(() => {
        if (showModal && mapRef.current && !mapInstanceRef.current) {
            // Load Leaflet if not already loaded
            if (!window.L) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);

                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = initializeMap;
                document.body.appendChild(script);
            } else {
                setTimeout(initializeMap, 100);
            }
        }

        function initializeMap() {
            if (mapRef.current && window.L && !mapInstanceRef.current) {
                // Center on Mindoro or existing coordinates
                const lat = formData.latitude ? parseFloat(formData.latitude) : 13.0;
                const lng = formData.longitude ? parseFloat(formData.longitude) : 121.2;
                
                const map = window.L.map(mapRef.current).setView([lat, lng], formData.latitude ? 13 : 9);
                
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);
                
                // Add existing marker if coordinates exist
                if (formData.latitude && formData.longitude) {
                    markerRef.current = window.L.marker([lat, lng]).addTo(map);
                }
                
                // Click event to set location
                map.on('click', function(e) {
                    const { lat, lng } = e.latlng;
                    
                    // Update form data
                    setFormData(prev => ({
                        ...prev,
                        latitude: lat.toFixed(8),
                        longitude: lng.toFixed(8)
                    }));
                    
                    // Remove old marker and add new one
                    if (markerRef.current) {
                        map.removeLayer(markerRef.current);
                    }
                    markerRef.current = window.L.marker([lat, lng]).addTo(map);
                });
                
                mapInstanceRef.current = map;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showModal]);

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
                        <div key={roomType.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                            {roomType.image_filename && (
                                <img
                                    src={`http://localhost:5001/uploads/${roomType.image_filename}`}
                                    alt={roomType.name}
                                    className="w-full h-48 object-cover"
                                />
                            )}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g., Calapan City, Puerto Galera"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pin Location on Map
                                    </label>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Click on the map to set the location coordinates
                                    </p>
                                    <div 
                                        ref={mapRef}
                                        className="h-96 w-full rounded-lg border border-gray-300"
                                    ></div>
                                    {formData.latitude && formData.longitude && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Current location: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Room Image
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
