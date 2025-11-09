import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import RoomCard from '../components/RoomCard.jsx'; // Use the card we just updated

function RoomsPage() {
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for search and sort
    const [searchTerm, setSearchTerm] = useState('');
    const [sortTerm, setSortTerm] = useState('default');
    const [activeSearch, setActiveSearch] = useState('');

    const fetchRoomTypes = async (currentSearch, currentSort) => {
        try {
            setLoading(true);
            
            const params = {};
            if (currentSearch) {
                params.search = currentSearch;
            }
            if (currentSort !== 'default') {
                params.sort = currentSort;
            }

            // Fetch from the new API endpoint
            const response = await axios.get('http://localhost:5001/api/room-types', { params });
            
            setRoomTypes(response.data);
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
        fetchRoomTypes(searchTerm, sortTerm);
    }, []); 

    // Handle form submission
    const handleSearch = (e) => {
        e.preventDefault(); 
        fetchRoomTypes(searchTerm, sortTerm);
    };
    
    // Handle clearing the search
    const clearSearch = () => {
        setSearchTerm('');
        setSortTerm('default');
        fetchRoomTypes('', 'default');
    };

    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Our Accommodations</h2>
                    <p className="mt-4 text-lg text-gray-500">Find the perfect room for your stay. We offer a variety of options to suit every need and budget.</p>
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
                            name="sort" 
                            value={sortTerm}
                            onChange={(e) => setSortTerm(e.target.value)}
                            className="mt-2 sm:mt-0 block w-full sm:w-auto rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                        >
                            <option value="default">Sort by... (Default)</option>
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
        </div>
    );
}

export default RoomsPage;