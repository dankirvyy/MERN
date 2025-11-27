import React from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentFailedPage({ type }) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">Payment Cancelled</h2>
                <p className="mt-2 text-gray-600">
                    Your payment was cancelled or failed. No charges were made.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={() => navigate(type === 'room' ? '/booking/confirm' : '/booking/confirm-tour')}
                        className="w-full rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full rounded-md bg-gray-200 px-4 py-2 text-gray-900 hover:bg-gray-300"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentFailedPage;
