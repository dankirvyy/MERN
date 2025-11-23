import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RoomAssignmentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    
    const [booking, setBooking] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchBookingAndRooms();
    }, [bookingId]);

    const fetchBookingAndRooms = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // Fetch booking details
            const bookingResponse = await axios.get(
                `http://localhost:5001/api/bookings/${bookingId}`,
                config
            );
            setBooking(bookingResponse.data);

            // Fetch available rooms for this room type
            if (bookingResponse.data.room_type_id) {
                const roomsResponse = await axios.get(
                    `http://localhost:5001/api/frontdesk/available-rooms/${bookingResponse.data.room_type_id}`,
                    config
                );
                setAvailableRooms(roomsResponse.data.rooms || roomsResponse.data);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data?.message || error.message || 'Error loading booking details';
            alert(errorMessage);
            setLoading(false);
        }
    };

    const handleAssignRoom = async () => {
        if (!selectedRoom) {
            alert('Please select a room');
            return;
        }

        setAssigning(true);
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.post(
                'http://localhost:5001/api/frontdesk/assign-room',
                {
                    bookingId: parseInt(bookingId),
                    roomId: parseInt(selectedRoom)
                },
                config
            );

            alert('Room assigned successfully!');
            navigate('/frontdesk/dashboard');
        } catch (error) {
            console.error('Error assigning room:', error);
            alert(error.response?.data?.message || 'Error assigning room');
            setAssigning(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/frontdesk/dashboard')}
                                className="text-gray-600 hover:text-orange-600"
                            >
                                ← Back
                            </button>
                            <h1 className="text-2xl font-bold text-orange-600">Room Assignment</h1>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Booking Information */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Booking Information</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Guest Name</label>
                                <p className="mt-1 text-lg">
                                    {booking?.Guest?.first_name} {booking?.Guest?.last_name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                <p className="mt-1 text-lg">{booking?.Guest?.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Room Type</label>
                                <p className="mt-1 text-lg">{booking?.RoomType?.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Number of Guests</label>
                                <p className="mt-1 text-lg">{booking?.num_guests}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Check-in</label>
                                <p className="mt-1 text-lg">
                                    {new Date(booking?.check_in_date).toLocaleDateString()} at {booking?.check_in_time}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Check-out</label>
                                <p className="mt-1 text-lg">
                                    {new Date(booking?.check_out_date).toLocaleDateString()} at {booking?.check_out_time}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Room Selection */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Select Available Room</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {availableRooms.length} room(s) available for {booking?.RoomType?.name}
                        </p>
                    </div>
                    <div className="p-6">
                        {availableRooms.length > 0 ? (
                            <div className="space-y-3">
                                {availableRooms.map((room) => (
                                    <label
                                        key={room.id}
                                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                                            selectedRoom === room.id.toString()
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-200 hover:border-orange-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="room"
                                            value={room.id}
                                            checked={selectedRoom === room.id.toString()}
                                            onChange={(e) => setSelectedRoom(e.target.value)}
                                            className="mr-4 h-4 w-4 text-orange-600"
                                        />
                                        <div className="flex-1">
                                            <p className="text-lg font-semibold">Room {room.room_number}</p>
                                            <p className="text-sm text-gray-600">{room.RoomType?.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Capacity: {room.RoomType?.capacity} guests | 
                                                ₱{parseFloat(room.RoomType?.price).toLocaleString()} per night
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                                                {room.status}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No available rooms found for this room type</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    All rooms may be occupied or under maintenance
                                </p>
                            </div>
                        )}

                        {availableRooms.length > 0 && (
                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                    onClick={() => navigate('/frontdesk/dashboard')}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignRoom}
                                    disabled={!selectedRoom || assigning}
                                    className={`px-6 py-2 rounded-lg text-white ${
                                        !selectedRoom || assigning
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-orange-600 hover:bg-orange-700'
                                    }`}
                                >
                                    {assigning ? 'Assigning...' : 'Assign Room'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomAssignmentPage;
