import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth.jsx';

function BookTourPage() {
    const { tourId } = useParams(); // Get tour ID from URL
    const { user } = useAuth();
    const navigate = useNavigate();

    // State for data
    const [tour, setTour] = useState(null);
    
    // State for form
    const [bookingDate, setBookingDate] = useState('');
    const [numPax, setNumPax] = useState(1);
    
    // Pre-fill user details from context
    const [firstName, setFirstName] = useState(user ? user.name.split(' ')[0] : '');
    const [lastName, setLastName] = useState(user ? user.name.split(' ').slice(1).join(' ') : '');
    const [email, setEmail] = useState(user ? user.email : '');
    const [phone, setPhone] = useState(user ? user.phone_number || '' : '');

    // State for loading and errors
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);

    // Get today's date for min attribute on date inputs
    const today = new Date().toISOString().split('T')[0];

    // Fetch tour details
    useEffect(() => {
        const fetchTour = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`http://localhost:5001/api/tours/${tourId}`);
                setTour(data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Failed to load tour data.');
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [tourId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError(null);

        // 1. Calculate Total Price
        const totalPrice = numPax * parseFloat(tour.price);

        // 2. Consolidate All Data
        const bookingDetails = {
            guestData: {
                id: user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone_number: phone,
            },
            tourData: {
                id: tour.id,
                name: tour.name,
                price: tour.price,
                duration: tour.duration,
            },
            bookingData: {
                tour_id: tour.id,
                booking_date: bookingDate,
                number_of_pax: numPax,
                total_price: totalPrice,
            }
        };

        // 3. Navigate to Confirmation Page with Data
        navigate('/booking/confirm-tour', { state: { booking: bookingDetails } });
    };

    const getImageUrl = (filename) => {
        if (!filename) {
            return 'https://images.unsplash.com/photo-1523999955322-74afa39a5712?auto=format&fit=crop&w=800&q=60';
        }
        return `http://localhost:5001/uploads/images/${filename}`;
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (!tour) return <div>Tour not found.</div>;

    const formattedPrice = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(tour.price);

    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    
                    {/* Column 1: Tour Details */}
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">{tour.name}</h2>
                        <p className="mt-4 text-lg text-gray-500">{tour.description}</p>
                        <div className="mt-6">
                            <img className="rounded-lg shadow-lg object-cover w-full h-80" src={getImageUrl(tour.image_filename)} alt={tour.name} />
                        </div>
                        <div className="mt-6 flex justify-between items-center">
                            <p className="text-2xl font-bold text-gray-900">{formattedPrice} <span className="text-lg font-medium text-gray-500">/ person</span></p>
                            <p className="text-md text-gray-600">Duration: {tour.duration}</p>
                        </div>
                    </div>

                    {/* Column 2: Booking Form */}
                    <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold text-gray-900">Book This Tour</h3>
                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <input type="hidden" name="tour_id" value={tour.id} />

                            <div>
                                <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700">Select Date</label>
                                <input 
                                    type="date" 
                                    name="booking_date" 
                                    id="booking_date" 
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    min={today}
                                    required 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="num_pax" className="block text-sm font-medium text-gray-700">Number of People</label>
                                <input 
                                    type="number" 
                                    name="num_pax" 
                                    id="num_pax" 
                                    min="1" 
                                    value={numPax}
                                    onChange={(e) => setNumPax(e.target.value)}
                                    required 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                />
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
                                <button type="submit" className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                                    Submit Reservation Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookTourPage;