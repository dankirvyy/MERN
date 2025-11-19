import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminFrontDeskPage() {
    const [bookings, setBookings] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUnassignedBookings();
    }, []);

    const fetchUnassignedBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.get('http://localhost:5001/api/admin/bookings/unassigned', config);
            setBookings(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setLoading(false);
        }
    };

    const handleAssignRoom = async (booking) => {
        setSelectedBooking(booking);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            // Fetch available rooms for this room type and date range
            const response = await axios.get(
                `http://localhost:5001/api/admin/rooms/available?room_type_id=${booking.room_type_id}&check_in=${booking.check_in_date}&check_out=${booking.check_out_date}`,
                config
            );
            setAvailableRooms(response.data);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching available rooms:', error);
            alert('Error fetching available rooms');
        }
    };

    const confirmAssignment = async () => {
        if (!selectedRoom) {
            alert('Please select a room');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.put(
                `http://localhost:5001/api/admin/bookings/${selectedBooking.id}/assign-room`,
                { room_id: selectedRoom },
                config
            );
            alert('Room assigned successfully!');
            setShowModal(false);
            setSelectedRoom('');
            fetchUnassignedBookings();
        } catch (error) {
            console.error('Error assigning room:', error);
            alert('Error assigning room');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Front Desk - Room Assignment</h1>
                <p className="mt-2 text-sm text-gray-600">Assign rooms to confirmed bookings</p>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">No unassigned bookings at the moment.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{booking.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.guest_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.room_type_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(booking.check_in_date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(booking.check_out_date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Pending Assignment
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleAssignRoom(booking)}
                                            className="text-orange-600 hover:text-orange-900"
                                        >
                                            Assign Room
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Assignment Modal */}
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Assign Room to Booking #{selectedBooking?.id}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Guest: <span className="font-semibold">{selectedBooking?.guest_name}</span><br />
                                        Room Type: <span className="font-semibold">{selectedBooking?.room_type_name}</span><br />
                                        Dates: {formatDate(selectedBooking?.check_in_date)} - {formatDate(selectedBooking?.check_out_date)}
                                    </p>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Available Room
                                    </label>
                                    <select
                                        value={selectedRoom}
                                        onChange={(e) => setSelectedRoom(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                    >
                                        <option value="">Choose a room...</option>
                                        {availableRooms.map((room) => (
                                            <option key={room.id} value={room.id}>
                                                Room {room.room_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={confirmAssignment}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Assign Room
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminFrontDeskPage;
