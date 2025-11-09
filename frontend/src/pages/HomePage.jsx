import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faHiking, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import TourCard from '../components/TourCard'; // We already have this
import RoomCard from '../components/RoomCard.jsx'; // The new card

function HomePage() {
  const [featuredTours, setFeaturedTours] = useState([]);
  const [featuredRooms, setFeaturedRooms] = useState([]);

  useEffect(() => {
    // Fetch featured tours (e.g., first 3 from the API)
    const fetchTours = async () => {
      try {
        const { data } = await axios.get('http://localhost:5001/api/tours');
        setFeaturedTours(data.slice(0, 3)); // Take only the first 3
      } catch (error) {
        console.error("Failed to fetch tours", error);
      }
    };

    const fetchRooms = async () => {
      try {
        const { data } = await axios.get('http://localhost:5001/api/room-types');
        setFeaturedRooms(data.slice(0, 3)); // Take only the first 3
      } catch (error) {
        console.error("Failed to fetch rooms", error);
      }
    };
    
    fetchTours();
    fetchRooms();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gray-800">
        <div className="absolute inset-0">
          <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Mindoro Beach" />
          <div className="absolute inset-0 bg-gray-800 mix-blend-multiply" aria-hidden="true"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Discover the Beauty of Mindoro</h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">Your gateway to unforgettable beaches, stunning waterfalls, and vibrant local culture. Book your adventure today!</p>
          <div className="mt-10">
            <Link to="/rooms" className="inline-block rounded-md border border-transparent bg-orange-600 px-8 py-3 text-base font-medium text-white hover:bg-orange-700">Book Your Stay</Link>
            <Link to="/tours" className="ml-4 inline-block rounded-md border border-transparent bg-white bg-opacity-20 px-8 py-3 text-base font-medium text-white backdrop-blur-sm backdrop-filter hover:bg-opacity-30">Explore Tours</Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-600 text-white">
                  <FontAwesomeIcon icon={faSun} size="lg" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Stunning Beaches</h3>
              <p className="mt-2 text-base text-gray-500">Discover the pristine white sand beaches and crystal-clear waters of Mindoro.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-600 text-white">
                  <FontAwesomeIcon icon={faHiking} size="lg" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Amazing Adventures</h3>
              <p className="mt-2 text-base text-gray-500">From majestic waterfalls to thrilling dive spots, your next adventure awaits.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-600 text-white">
                  <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Easy Booking</h3>
              <p className="mt-2 text-base text-gray-500">Secure your room or tour in just a few clicks with our simple booking system.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Featured Accommodations */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Accommodations</h2>
            <p className="mt-4 text-lg text-gray-500">Comfortable and relaxing rooms for every traveler.</p>
          </div>
          <div className="mt-10 grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {featuredRooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                The Jewel of the Philippines
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Mindoro is an island of incredible diversity, from the stunning coral reefs of the Apo Reef Natural Park to the rugged mountains and the rich, ancestral culture of the Mangyan tribes.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                Whether you're here to dive in Puerto Galera, one of the world's most beautiful bays, or to relax on the secluded beaches of the west coast, Mindoro offers an unforgettable escape.
              </p>
            </div>
            <div className="mt-10 lg:mt-0">
              <img className="rounded-lg shadow-xl object-cover w-full h-80"
                src="http://localhost:5001/uploads/images/Tamaraw-Falls-1.jpg"
                alt="Tamaraw Falls in Mindoro" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Explore Mindoro's Wonders</h2>
            <p className="mt-4 text-lg text-gray-500">Guided tours to the best spots on the island.</p>
          </div>
          <div className="mt-10 grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {featuredTours.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">What Our Guests Say</h2>
            <p className="mt-4 text-lg text-gray-500">We're proud to have created unforgettable memories.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <img className="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=facearea&auto=format&q=80" alt="Testimonial user" />
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Alex R.</p>
                  <p className="text-sm text-gray-500">Visited June 2024</p>
                </div>
              </div>
              <p className="text-base text-gray-600">"An amazing experience! The tour guides were so knowledgeable, and the room was beyond our expectations. We will be back!"</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <img className="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=facearea&auto=format&q=80" alt="Testimonial user" />
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Maria S.</p>
                  <p className="text-sm text-gray-500">Visited May 2024</p>
                </div>
              </div>
              <p className="text-base text-gray-600">"Booking was so simple. The 'My Profile' page made it easy to see all my reservations in one place. Highly recommend!"</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <img className="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?fit=facearea&auto=format&q=80" alt="Testimonial user" />
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Chris J.</p>
                  <p className="text-sm text-gray-500">Visited May 2024</p>
                </div>
              </div>
              <p className="text-base text-gray-600">"Mindoro is beautiful. The "Tamaraw Falls" tour was the highlight of our trip. Thank you, Visit Mindoro, for all the help."</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;