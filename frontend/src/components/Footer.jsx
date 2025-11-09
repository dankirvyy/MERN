import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

function Footer() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  return (
    <>
      <section className="bg-gray-800 py-12 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Visit Mindoro</h3>
            <p className="text-sm">
              Your trusted partner for unforgettable adventures and serene stays in the beautiful island of Mindoro.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-orange-400">Home</Link></li>
              <li><Link to="/rooms" className="text-sm hover:text-orange-400">Rooms</Link></li>
              <li><Link to="/tours" className="text-sm hover:text-orange-400">Tours</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-orange-400">Contact Us</Link></li>
              {user && (
                <li><Link to="/my-profile" className="text-sm hover:text-orange-400">My Profile</Link></li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm hover:text-orange-400">Help Center</Link></li>
              <li><Link to="/faq" className="text-sm hover:text-orange-400">FAQs</Link></li>
              <li><Link to="/privacy" className="text-sm hover:text-orange-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-orange-400">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-orange-400"><FontAwesomeIcon icon={faFacebookF} size="lg" /></a>
              <a href="#" className="text-gray-300 hover:text-orange-400"><FontAwesomeIcon icon={faTwitter} size="lg" /></a>
              <a href="#" className="text-gray-300 hover:text-orange-400"><FontAwesomeIcon icon={faInstagram} size="lg" /></a>
            </div>
            <p className="mt-4 text-sm">
              Subscribe to our newsletter for updates!
            </p>
            <form className="mt-2">
              <input type="email" placeholder="Your email" className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <button type="submit" className="mt-2 w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 rounded-md">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Visit Mindoro. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

export default Footer;