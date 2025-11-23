import React from 'react';
import { Link } from 'react-router-dom';

const getImageUrl = (filename) => {
    if (!filename) {
        // Default placeholder from your rooms.php
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60';
    }
    return `http://localhost:5001/uploads/${filename}`;
}

function RoomCard({ room }) {
  // Format price to PHP
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(room.base_price);

  return (
    <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
      <div className="flex-shrink-0">
        <img className="h-56 w-full object-cover" src={getImageUrl(room.image_filename)} alt={room.name} />
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
          {room.location && (
            <p className="mt-1 text-sm text-orange-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              {room.location}
            </p>
          )}
          <p className="mt-3 text-base text-gray-500">
            {room.description ? room.description.substring(0, 120) + '...' : 'No description.'}
          </p>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium text-gray-900">
                {formattedPrice} <span className="text-sm text-gray-500">/ night</span>
            </p>
            <p className="text-sm text-gray-500">Sleeps {room.capacity}</p>
          </div>
          
          {/* Note: Your PHP had logic for 'available_rooms_count'.
            This requires a more complex query. For now, we'll just show 'Book Now'.
            We can add the "Fully Booked" status later.
          */}
          <Link 
            to={`/book/room/${room.id}`} 
            className="mt-4 block w-full text-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-orange-700"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;