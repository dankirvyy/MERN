import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LocationMap from '../components/LocationMap.jsx'; 


import 'leaflet/dist/leaflet.css';

function TourDetailPage() {
    const { tourId } = useParams();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTour = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`http://localhost:5001/api/tours/${tourId}`);
                setTour(data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Failed to load tour details.');
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [tourId]);

    const getImageUrl = (filename) => {
        if (!filename) {
            return 'https://images.unsplash.com/photo-1523999955322-74afa39a5712?auto=format&fit=crop&w=800&q=60';
        }
        return `http://localhost:5001/uploads/images/${filename}`;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (!tour) return <div>Tour not found.</div>;

    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/tours" className="text-sm font-medium text-gray-500 hover:text-orange-600 flex items-center mb-6">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Tours
                </Link>

                <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                    {/* Column 1: Image and Map */}
                    <div className="lg:col-span-2">
                        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                            <img src={getImageUrl(tour.image_filename)} alt={tour.name} className="w-full h-full object-center object-cover" />
                        </div>
                        
                        {/* --- Conditional Map --- */}
                        {tour.latitude && tour.longitude && (
                            <div className="mt-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tour Location</h2>
                                <div className="h-96 w-full rounded-lg shadow-md overflow-hidden">
                                    <LocationMap
                                        lat={tour.latitude}
                                        lng={tour.longitude}
                                        popupText={tour.name}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Column 2: Details and Booking Button */}
                    <div className="mt-10 lg:mt-0 lg:col-span-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{tour.name}</h1>

                        <div className="mt-3">
                            <h2 className="sr-only">Tour information</h2>
                            <p className="text-3xl text-gray-900">{formatPrice(tour.price)} <span className="text-xl text-gray-500 font-normal">/ person</span></p>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 space-y-6">
                                {/* Use dangerouslySetInnerHTML to render line breaks (nl2br) */}
                                <p dangerouslySetInnerHTML={{ __html: tour.description.replace(/\n/g, '<br />') }} />
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <p className="text-sm text-gray-500"><span className="font-medium text-gray-700">Duration:</span> {tour.duration}</p>
                        </div>

                        <div className="mt-10 flex">
                            <Link 
                                to={`/book/tour/${tour.id}`} 
                                className="flex-1 bg-orange-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-orange-500"
                            >
                                Book This Tour
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TourDetailPage;