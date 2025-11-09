import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

// --- Import Leaflet's CSS ---
import 'leaflet/dist/leaflet.css';
import ContactMap from '../components/ContactMap.jsx'; // Import the map

function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would send the form data to your backend
        console.log({ name, email, message });
        alert('Message sent (in console)!');
        // Clear form
        setName('');
        setEmail('');
        setMessage('');
    };

    return (
        <div className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Contact Us</h2>
                    <p className="mt-4 text-lg text-gray-500">Have questions? We'd love to hear from you.</p>
                </div>
                
                <div className="mt-12 lg:grid lg:grid-cols-2 lg:gap-16">
                    {/* Column 1: Info and Map */}
                    <div className="flex flex-col">
                        <h3 className="text-2xl font-bold text-gray-900">Our Office</h3>
                        <p className="mt-3 text-base text-gray-500">Find us at our main office in Calapan City.</p>
                        <div className="mt-6 space-y-4 text-base text-gray-700">
                            <p className="flex items-center">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-600 w-6" />
                                <span className="ml-3">J.P. Rizal St, Calapan City, Oriental Mindoro</span>
                            </p>
                            <p className="flex items-center">
                                <FontAwesomeIcon icon={faPhone} className="text-orange-600 w-6" />
                                <span className="ml-3">(+63) 123-456-7890</span>
                            </p>
                            <p className="flex items-center">
                                <FontAwesomeIcon icon={faEnvelope} className="text-orange-600 w-6" />
                                <span className="ml-3">info@visitmindoro.com</span>
                            </p>
                        </div>
                        
                        <div className="mt-6 h-96 w-full rounded-lg shadow-md overflow-hidden">
                            {/* Render the map component here */}
                            <ContactMap />
                        </div>
                    </div>

                    {/* Column 2: Contact Form */}
                    <div className="mt-12 lg:mt-0">
                        <h3 className="text-2xl font-bold text-gray-900">Send Us a Message</h3>
                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <div className="mt-1">
                                    <input 
                                        type="text" 
                                        name="name" 
                                        id="name" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                        className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <div className="mt-1">
                                    <input 
                                        id="email" 
                                        name="email" 
                                        type="email" 
                                        autoComplete="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                        className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                                <div className="mt-1">
                                    <textarea 
                                        id="message" 
                                        name="message" 
                                        rows="4" 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required 
                                        className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                                    ></textarea>
                                </div>
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;