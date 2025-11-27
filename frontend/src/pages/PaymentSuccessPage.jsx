import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccessPage({ type }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [processing, setProcessing] = useState(true);
    const [error, setError] = useState('');
    const hasProcessedRef = useRef(false);

    useEffect(() => {
        // Prevent duplicate processing using ref (persists across re-renders)
        if (hasProcessedRef.current) {
            console.log('Already processed, skipping...');
            return;
        }

        const processPayment = async () => {
            const storageKey = type === 'room' ? 'pending_booking' : 'pending_tour_booking';
            
            // Try to get source_id from URL first, then fall back to localStorage
            let sourceId = searchParams.get('source_id');
            console.log('Source ID from URL:', sourceId);
            
            if (!sourceId) {
                sourceId = localStorage.getItem('paymongo_source_id');
                console.log('Source ID from localStorage:', sourceId);
            }
            
            const bookingDataStr = localStorage.getItem(storageKey);
            const token = sessionStorage.getItem('token');

            console.log('Payment callback - storage key:', storageKey);
            console.log('Payment callback - source_id:', sourceId);
            console.log('Payment callback - booking data length:', bookingDataStr?.length);
            console.log('Payment callback - token exists:', !!token);
            console.log('Full callback URL:', window.location.href);
            console.log('All localStorage keys:', Object.keys(localStorage));

            if (!sourceId) {
                setError('Payment verification failed. No payment source ID found.');
                setProcessing(false);
                return;
            }

            if (!bookingDataStr) {
                setError('Booking data not found. Please try again.');
                setProcessing(false);
                return;
            }

            // Mark as processed immediately using ref (before clearing storage)
            hasProcessedRef.current = true;

            // Clear localStorage immediately after marking as processed
            localStorage.removeItem(storageKey);
            localStorage.removeItem('paymongo_source_id');

            try {

                const bookingData = JSON.parse(bookingDataStr);

                console.log('Creating booking with payment_id:', sourceId);

                // PayMongo redirecting to success URL means payment was successful
                // Create the booking directly with the source_id as payment reference
                const endpoint = type === 'room' ? '/api/bookings/room' : '/api/bookings/tour';
                
                const response = await axios.post(`http://localhost:5001${endpoint}`, {
                    ...bookingData.bookingData,
                    payment_method: 'gcash',
                    payment_id: sourceId // Use source_id as payment reference
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Booking created successfully:', response.data);

                setProcessing(false);
                
                // Redirect to my-profile page after 2 seconds
                setTimeout(() => {
                    navigate('/my-profile');
                }, 2000);
            } catch (err) {
                console.error('Payment processing error:', err);
                console.error('Error details:', err.response?.data);
                
                // Check if it's a duplicate booking error
                if (err.response?.data?.message?.includes('already exists') || 
                    err.response?.data?.message?.includes('duplicate')) {
                    // Already created, just redirect
                    setProcessing(false);
                    setTimeout(() => {
                        navigate('/my-profile');
                    }, 2000);
                } else {
                    setError(err.response?.data?.message || 'Failed to complete booking. Please contact support.');
                    setProcessing(false);
                }
            }
        };

        processPayment();
    }, [type, navigate, searchParams]);

    if (processing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">Processing Payment...</h2>
                    <p className="mt-2 text-gray-600">Please wait while we verify your payment.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">Payment Failed</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 w-full rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">Payment Successful!</h2>
                <p className="mt-2 text-gray-600">
                    Your {type === 'room' ? 'room' : 'tour'} booking has been confirmed.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                    Redirecting to your bookings...
                </p>
            </div>
        </div>
    );
}

export default PaymentSuccessPage;
