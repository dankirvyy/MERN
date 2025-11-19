import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
// REMOVED PayPalScriptProvider and PayPalButtons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { faPaypal } from '@fortawesome/free-brands-svg-icons'; // 1. IMPORT PAYPAL ICON

// --- Helper Functions (Same as before) ---
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(price);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
};

// --- 2. UPDATED MODAL COMPONENT ---
function PaymentSimulationModal({ isOpen, onClose, onConfirm, method }) {
    if (!isOpen) return null;

    const getIcon = () => {
        if (method === 'gcash') {
            return <img className="h-8 w-8" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZP_xjIqcvTS8MoWqso_WkLX3bG6zXGMJdDg&s" alt="GCash" />;
        }
        if (method === 'paymaya') {
            return <FontAwesomeIcon icon={faCreditCard} className="h-8 w-8 text-blue-600" />;
        }
        // ADDED PAYPAL
        if (method === 'paypal') {
            return <FontAwesomeIcon icon={faPaypal} className="h-8 w-8 text-blue-800" />;
        }
        return null;
    };
    
    // Helper to get the name
    const getMethodName = () => {
        if (method === 'gcash') return 'GCash';
        if (method === 'paymaya') return 'PayMaya';
        if (method === 'paypal') return 'PayPal';
        return 'Payment';
    }

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            {getIcon()}
                        </div>
                        <div className="mt-3 text-center sm:mt-5">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                                Simulate {getMethodName()} Payment
                            </h3>
                            <div className="mt-4">
                               <p className="text-sm text-gray-600">This is a simulation. No real payment is required.</p>
                               <p className="text-sm text-gray-600 mt-2">Click "Confirm Payment" to complete your booking.</p>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 flex gap-3">
                            <button type="button" onClick={onClose} className="flex-1 inline-flex justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500">
                                Cancel
                            </button>
                            <button type="button" onClick={onConfirm} className="flex-1 inline-flex justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700">
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Main Component ---
function ConfirmBookingPage() {
    const navigate = useNavigate();
    const { state } = useLocation(); 
    const { booking } = state || {};

    const [paymentMethod, setPaymentMethod] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 3. REMOVED PAYPAL_CLIENT_ID, priceInUSD, createOrder, and onApprove

    if (!booking) {
        return (
            <div className="text-center p-12">
                <h2 className="text-2xl font-bold">Error: No booking data found.</h2>
                <Link to="/rooms" className="text-orange-600">Please start your booking again.</Link>
            </div>
        );
    }

    const finalizeBooking = async (paymentDetails) => {
        setIsSubmitting(true);
        setError(null);
        
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const body = {
                room_type_id: booking.bookingData.room_type_id,
                check_in_date: booking.bookingData.check_in_date,
                check_out_date: booking.bookingData.check_out_date,
                check_in_time: booking.bookingData.check_in_time,
                check_out_time: booking.bookingData.check_out_time,
                total_price: booking.bookingData.total_price,
                payment_method: paymentDetails.method,
                payment_id: paymentDetails.id 
            };
            
            console.log('Sending booking data:', body);
            
            await axios.post('http://localhost:5001/api/bookings/room', body, config);
            
            if (isModalOpen) setIsModalOpen(false);
            
            navigate('/my-profile'); // Redirect to My Profile

        } catch (err) {
            console.error('Booking error:', err);
            console.error('Error response:', err.response?.data);
            setError(err.response?.data?.message || 'A critical error occurred. Please contact support.');
            setIsSubmitting(false);
        }
    };
    
    // 4. RENAMED handleGcashSubmit to handlePaymentSubmit
    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        // This function now just opens the modal
        setIsModalOpen(true);
    };
    
    // This function is triggered by the modal
    const onModalConfirm = () => {
        finalizeBooking({
            method: paymentMethod,
            id: `${paymentMethod}_${new Date().getTime()}` // Fake payment ID
        });
    };

    // 5. REMOVED PayPalScriptProvider wrapper
    return (
        <>
            <div className="bg-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">Review Your Reservation</h2>
                        <p className="mt-4 text-lg text-gray-500">Please confirm the details below before finalizing.</p>
                    </div>
                    
                    <div className="mt-10 bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Booking Details */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                                    <dl className="mt-4 space-y-4">
                                        <div className="flex justify-between"><dt className="text-sm font-medium text-gray-500">Room Type</dt><dd className="text-sm font-medium text-gray-900">{booking.roomTypeData.name}</dd></div>
                                        <div className="flex justify-between"><dt className="text-sm font-medium text-gray-500">Check-in</dt><dd className="text-sm font-medium text-gray-900">{formatDate(booking.bookingData.check_in_date)} {booking.bookingData.check_in_time ? `@ ${booking.bookingData.check_in_time}` : ''}</dd></div>
                                        <div className="flex justify-between"><dt className="text-sm font-medium text-gray-500">Check-out</dt><dd className="text-sm font-medium text-gray-900">{formatDate(booking.bookingData.check_out_date)} {booking.bookingData.check_out_time ? `@ ${booking.bookingData.check_out_time}` : ''}</dd></div>
                                        <div className="flex justify-between"><dt className="text-sm font-medium text-gray-500">Duration</dt><dd className="text-sm font-medium text-gray-900">{booking.bookingData.days} night(s)</dd></div>
                                        <div className="flex justify-between border-t pt-4"><dt className="text-lg font-bold text-gray-900">Total Price</dt><dd className="text-lg font-bold text-orange-600">{formatPrice(booking.bookingData.total_price)}</dd></div>
                                    </dl>
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Note:</strong> Your room number will be assigned by our front desk staff upon confirmation of your booking. You will be notified via email.
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Guest Information */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Guest Information</h3>
                                    <dl className="mt-4 space-y-4">
                                        <div className="flex justify-between"><dt className="text-sm font-medium text-gray-500">Full Name</dt><dd className="text-sm font-medium text-gray-900">{`${booking.guestData.first_name} ${booking.guestData.last_name}`}</dd></div>
                                        <div className="flex justify-between"><dt className="text-sm font-medium text-gray-500">Email</dt><dd className="text-sm font-medium text-gray-900">{booking.guestData.email}</dd></div>
                                        <div className="flex justify-between"><dt className="text-sm font-medium text-gray-500">Phone</dt><dd className="text-sm font-medium text-gray-900">{booking.guestData.phone_number}</dd></div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        
                        {/* 6. UPDATED Payment Section */}
                        <div className="px-6 py-4 bg-gray-50 border-t">
                            <form id="booking-payment-form" onSubmit={handlePaymentSubmit}>
                                {error && <div className="mb-4 text-center text-red-600">{error}</div>}
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose a payment method</label>
                                    <div className="flex items-center gap-4">
                                        {/* GCash Radio */}
                                        <label className="cursor-pointer">
                                            <input type="radio" name="payment_method_choice" value="gcash" onChange={(e) => setPaymentMethod(e.target.value)} className="payment-method-input peer hidden" />
                                            <span className="flex h-12 w-24 items-center justify-center rounded-lg border border-gray-300 text-sm font-medium transition-all peer-checked:border-orange-600 peer-checked:ring-2 peer-checked:ring-orange-500">
                                                <img className="h-6" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZP_xjIqcvTS8MoWqso_WkLX3bG6zXGMJdDg&s" alt="GCash Logo" />
                                            </span>
                                        </label>
                                        {/* PayMaya Radio */}
                                        <label className="cursor-pointer">
                                            <input type="radio" name="payment_method_choice" value="paymaya" onChange={(e) => setPaymentMethod(e.target.value)} className="payment-method-input peer hidden" />
                                            <span className="flex h-12 w-24 items-center justify-center rounded-lg border border-gray-300 text-sm font-medium transition-all peer-checked:border-orange-600 peer-checked:ring-2 peer-checked:ring-orange-500">
                                                <FontAwesomeIcon icon={faCreditCard} className="h-6 text-blue-600" />
                                            </span>
                                        </label>
                                        {/* PayPal Radio (NEW) */}
                                        <label className="cursor-pointer">
                                            <input type="radio" name="payment_method_choice" value="paypal" onChange={(e) => setPaymentMethod(e.target.value)} className="payment-method-input peer hidden" />
                                            <span className="flex h-12 w-24 items-center justify-center rounded-lg border border-gray-300 text-sm font-medium transition-all peer-checked:border-orange-600 peer-checked:ring-2 peer-checked:ring-orange-500">
                                                <FontAwesomeIcon icon={faPaypal} className="h-6 text-blue-800" />
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                
                                {/* REMOVED PayPalButtons div */}
                                
                                <div className="flex justify-end gap-x-4">
                                    <Link to={`/book/room/${booking.roomTypeData.id}`} className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Go Back & Edit</Link>
                                    
                                    {/* UPDATED Pay Button */}
                                    <button 
                                        id="pay-button" 
                                        type="submit" 
                                        className={`rounded-md bg-orange-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm ${paymentMethod ? 'block' : 'hidden'} disabled:opacity-50`}
                                        disabled={isSubmitting || !paymentMethod}
                                    >
                                        {isSubmitting ? 'Processing...' : `Pay with ${paymentMethod}`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Render The Modal */}
            <PaymentSimulationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={onModalConfirm}
                method={paymentMethod}
            />
        </>
    );
}

export default ConfirmBookingPage;