import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth.jsx';

function BookRoomPage() {
    const { roomTypeId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [roomType, setRoomType] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    
    // Form State
    const [roomId, setRoomId] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    
    // User Details (pre-filled)
    const [firstName, setFirstName] = useState(user ? user.name.split(' ')[0] : '');
    const [lastName, setLastName] = useState(user ? user.name.split(' ').slice(1).join(' ') : '');
    const [email, setEmail] = useState(user ? user.email : '');
    const [phone, setPhone] = useState(user ? user.phone_number || '' : '');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const typeRes = await axios.get(`http://localhost:5001/api/room-types/${roomTypeId}`);
                setRoomType(typeRes.data);

                const roomsRes = await axios.get(`http://localhost:5001/api/room-types/${roomTypeId}/available`);
                setAvailableRooms(roomsRes.data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Failed to load room data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [roomTypeId]);

    // --- THIS IS THE REFACTORED FUNCTION ---
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError(null);

        // --- 1. Validation ---
        if (new Date(checkOut) <= new Date(checkIn)) {
            setFormError('Check-out date must be after check-in date.');
            return;
        }

        // --- 2. Calculate Price ---
        const date1 = new Date(checkIn);
        const date2 = new Date(checkOut);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalPrice = diffDays * parseFloat(roomType.base_price);
        const selectedRoom = availableRooms.find(r => r.id === parseInt(roomId));

        // --- 3. Consolidate All Data ---
        const bookingDetails = {
            guestData: {
                id: user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone_number: phone,
            },
            roomTypeData: {
                id: roomType.id,
                name: roomType.name,
                base_price: roomType.base_price,
            },
            bookingData: {
                room_id: roomId,
                room_number: selectedRoom.room_number,
                check_in_date: checkIn,
                check_out_date: checkOut,
                days: diffDays,
                total_price: totalPrice,
            }
        };

        // --- 4. Navigate to Confirmation Page with Data ---
        navigate('/booking/confirm', { state: { booking: bookingDetails } });
    };

    const getImageUrl = (filename) => {
        if (!filename) {
            return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60';
        }
        return `http://localhost:5001/uploads/images/${filename}`;
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (!roomType) return <div>Room not found.</div>;

    const formattedPrice = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(roomType.base_price);

    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    
                    {/* Column 1: Room Details */}
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">{roomType.name}</h2>
                        <p className="mt-4 text-lg text-gray-500">{roomType.description}</p>
                        <div className="mt-6">
                            <img className="rounded-lg shadow-lg object-cover w-full h-80" src={getImageUrl(roomType.image_filename)} alt={roomType.name} />
                        </div>
                        <div className="mt-6 flex justify-between items-center">
                            <p className="text-2xl font-bold text-gray-900">{formattedPrice} <span className="text-lg font-medium text-gray-500">/ night</span></p>
                            <p className="text-md text-gray-600">Sleeps up to {roomType.capacity} guests</p>
                        </div>
                    </div>

                    {/* Column 2: Booking Form */}
                    <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold text-gray-900">Reserve Your Stay</h3>
                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <input type="hidden" name="room_type_id" value={roomTypeId} />

                            <div>
                                <label htmlFor="room_id" className="block text-sm font-medium text-gray-700">Select an Available Room</label>
                                <select 
                                    id="room_id" 
                                    name="room_id" 
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    required 
                                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
                                >
                                    {availableRooms.length > 0 ? (
                                        <>
                                            <option value="" disabled>Choose a room...</option>
                                            {availableRooms.map(room => (
                                                <option key={room.id} value={room.id}>{room.room_number}</option>
                                            ))}
                                        </>
                                    ) : (
                                        <option value="" disabled>No rooms of this type are available</option>
                                    )}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="checkin" className="block text-sm font-medium text-gray-700">Check-in Date</label>
                                    <input 
                                        type="date" 
                                        name="checkin" 
                                        id="checkin" 
                                        value={checkIn}
                                        min={today}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        required 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="checkout" className="block text-sm font-medium text-gray-700">Check-out Date</label>
                                    <input 
                                        type="date" 
                                        name="checkout" 
                                        id="checkout" 
                                        value={checkOut}
                                        min={checkIn || today}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        required 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <hr className="border-gray-200"/>
                            <h4 className="text-lg font-medium text-gray-900">Your Details</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input type="text" name="first_name" id="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input type="text" name="last_name" id="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="text" name="phone" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                            </div>
                            
                            {formError && <div className="text-red-600 text-sm text-center">{formError}</div>}

                            <div>
                                <button 
                                    type="submit" 
                                    className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={availableRooms.length === 0}
                                >
                                    Submit Reservation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookRoomPage;