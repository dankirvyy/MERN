import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import RoomCard from '../components/RoomCard.jsx'; // Use the card we just updated

function RoomsPage() {
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    // State for search and sort
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [sortTerm, setSortTerm] = useState('default');
    const [activeSearch, setActiveSearch] = useState('');
    const [locations, setLocations] = useState([]);

    const fetchRoomTypes = async (currentSearch, currentSort, currentLocation) => {
        try {
            setLoading(true);
            
            const params = {};
            if (currentSearch) {
                params.search = currentSearch;
            }
            if (currentSort !== 'default') {
                params.sort = currentSort;
            }
            if (currentLocation) {
                params.location = currentLocation;
            }

            // Fetch from the new API endpoint
            const response = await axios.get('http://localhost:5001/api/room-types', { params });
            
            setRoomTypes(response.data);
            
            // Extract unique locations for filter dropdown
            const uniqueLocations = [...new Set(response.data.map(room => room.location).filter(Boolean))];
            setLocations(uniqueLocations);
            
            setActiveSearch(currentSearch);
            setError(null);
        } catch (err) {
            setError('Failed to fetch rooms. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchRoomTypes('', 'default', '');
    }, []); 

    // Handle form submission
    const handleSearch = (e) => {
        e.preventDefault(); 
        fetchRoomTypes(searchTerm, sortTerm, locationFilter);
    };
    
    // Handle clearing the search
    const clearSearch = () => {
        setSearchTerm('');
        setSortTerm('default');
        setLocationFilter('');
        fetchRoomTypes('', 'default', '');
    };

    // Initialize map when modal opens
    useEffect(() => {
        if (showMapModal) {
            // Clean up previous map instance
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

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
                // Leaflet already loaded, initialize immediately
                setTimeout(initializeMap, 100);
            }
        }

        function initializeMap() {
            if (mapRef.current && window.L && !mapInstanceRef.current) {
                // Center on Mindoro
                const map = window.L.map(mapRef.current).setView([13.0, 121.2], 9);
                
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);
                
                // Add markers for each room with location
                let hasMarkers = false;
                roomTypes.forEach(room => {
                    if (room.latitude && room.longitude) {
                        const lat = parseFloat(room.latitude);
                        const lng = parseFloat(room.longitude);
                        
                        if (!isNaN(lat) && !isNaN(lng)) {
                            hasMarkers = true;
                            const marker = window.L.marker([lat, lng]).addTo(map);
                            marker.bindPopup(`
                                <div style="padding: 8px; min-width: 200px;">
                                    <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${room.name}</h3>
                                    <p style="font-size: 13px; color: #666; margin-bottom: 4px;">${room.location || ''}</p>
                                    <p style="color: #ea580c; font-weight: 600; margin: 4px 0;">₱${parseFloat(room.base_price).toLocaleString()}/night</p>
                                    <p style="font-size: 12px; color: #888;">Capacity: ${room.capacity} guests</p>
                                    <a href="/book/room/${room.id}" style="color: #ea580c; text-decoration: underline; font-size: 13px; display: block; margin-top: 8px;">Book Now</a>
                                </div>
                            `);
                        }
                    }
                });
                
                if (hasMarkers) {
                    // Fit map to show all markers
                    const group = new window.L.featureGroup(
                        roomTypes
                            .filter(room => room.latitude && room.longitude)
                            .map(room => window.L.marker([parseFloat(room.latitude), parseFloat(room.longitude)]))
                    );
                    map.fitBounds(group.getBounds().pad(0.1));
                }
                
                mapInstanceRef.current = map;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showMapModal]);

    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Our Accommodations</h2>
                    <p className="mt-4 text-lg text-gray-500">Find the perfect room for your stay. We offer a variety of options to suit every need and budget.</p>
                    
                    <button
                        onClick={() => setShowMapModal(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-orange-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-700"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        View Locations on Map
                    </button>
                </div>
                
                {/* Search and Sort Form */}
                <div className="mt-8 max-w-2xl mx-auto">
                    <form onSubmit={handleSearch} className="sm:flex sm:items-center sm:gap-4">
                        <input
                            type="search"
                            name="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                            placeholder="Search for room types..."
                        />
                        
                        <select 
                            name="location" 
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="mt-2 sm:mt-0 block w-full sm:w-auto rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                        >
                            <option value="">All Locations</option>
                            {locations.map((location, index) => (
                                <option key={index} value={location}>{location}</option>
                            ))}
                        </select>
                        
                        <select 
                            name="sort" 
                            value={sortTerm}
                            onChange={(e) => setSortTerm(e.target.value)}
                            className="mt-2 sm:mt-0 block w-full sm:w-auto rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                        >
                            <option value="default">Sort by</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Name: A to Z</option>
                        </select>
                        
                        <button type="submit" className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500">
                            Search
                        </button>
                    </form>
                </div>
                
                {/* Loading / Error / Content */}
                {loading ? (
                    <div className="text-center text-gray-500 mt-12">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500 mt-12">{error}</div>
                ) : (
                    <div className="mt-12 grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {roomTypes.length === 0 ? (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500">
                                <p className="text-xl">
                                    No rooms found
                                    {activeSearch && ` matching "${activeSearch}"`}
                                    .
                                </p>
                                <button onClick={clearSearch} className="mt-2 text-orange-600 hover:text-orange-500">
                                    Clear search
                                </button>
                            </div>
                        ) : (
                            roomTypes.map(room => (
                                <RoomCard key={room.id} room={room} />
                            ))
                        )}
                    </div>
                )}
            </div>
            
            {/* Map Modal */}
            {showMapModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowMapModal(false)}>
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-gray-900">Room Locations</h3>
                            <button
                                onClick={() => setShowMapModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div ref={mapRef} className="w-full h-96 rounded-lg"></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoomsPage;