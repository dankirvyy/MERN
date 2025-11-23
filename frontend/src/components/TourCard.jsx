import React from 'react';
import { Link } from 'react-router-dom';

const getImageUrl = (filename) => {
    if (!filename) {
        return 'https://images.unsplash.com/photo-1523999955322-74afa39a5712?auto=format&fit=crop&w=800&q=60';
    }
    return `http://localhost:5001/uploads/${filename}`;
}

function TourCard({ tour }) {
  // Format price to PHP
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(tour.price);

  return (
    <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
      <div className="flex-shrink-0">
        <img className="h-56 w-full object-cover" src={getImageUrl(tour.image_filename)} alt={tour.name} />
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{tour.name}</h3>
          <p className="mt-3 text-base text-gray-500">
            {tour.description ? tour.description.substring(0, 120) + '...' : 'No description.'}
          </p>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium text-gray-900">
              {formattedPrice} <span className="text-sm text-gray-500">/ person</span>
            </p>
            <p className="text-sm text-gray-500">{tour.duration}</p>
          </div>
          {/* New Buttons from your design */}
          <Link 
            to={`/tour/${tour.id}`} 
            className="mt-4 block w-full text-center rounded-md border border-orange-600 bg-white px-4 py-2 text-base font-medium text-orange-600 shadow-sm hover:bg-orange-50"
          >
            Learn More
          </Link>
          <Link 
            to={`/book/tour/${tour.id}`} 
            className="mt-2 block w-full text-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-orange-700"
          >
            Book Tour
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TourCard;