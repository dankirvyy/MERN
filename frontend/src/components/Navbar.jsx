import React, { useState } from 'react';
// 1. Import NavLink instead of Link
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx'; // Updated path

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getAvatarUrl = () => {
    if (user && user.avatar_filename) {
      return `http://localhost:5001/uploads/avatars/${user.avatar_filename}`;
    }
    return 'https://via.placeholder.com/32/cccccc/888888?text=U';
  };

  // --- 2. Define our reusable style classes ---
  const desktopBaseClass = "px-3 py-2 rounded-md text-sm font-medium";
  const desktopActiveClass = "font-semibold text-orange-600";
  const desktopInactiveClass = "text-gray-500 hover:text-gray-900";

  // Helper function for NavLink className
  const getDesktopNavLinkClass = ({ isActive }) => {
    return `${desktopBaseClass} ${isActive ? desktopActiveClass : desktopInactiveClass}`;
  };

  const mobileBaseClass = "block px-3 py-2 rounded-md text-base font-medium";
  // Use the same active style as your PHP example
  const mobileActiveClass = "bg-gray-100 text-orange-600"; 
  const mobileInactiveClass = "text-gray-700 hover:bg-gray-50";

  const getMobileNavLinkClass = ({ isActive }) => {
    return `${mobileBaseClass} ${isActive ? mobileActiveClass : mobileInactiveClass}`;
  };


  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            {/* Logo still uses a simple Link */}
            <Link to="/" className="flex items-center gap-3 text-3xl font-bold text-orange-600">
              <img className="h-10 w-auto" src="/logo.png" alt="Visit Mindoro Logo" />
              <span>Visit Mindoro</span>
            </Link>
          </div>

          {/* --- 3. Desktop Menu uses NavLink --- */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLink to="/" className={getDesktopNavLinkClass} end>Home</NavLink>
            <NavLink to="/rooms" className={getDesktopNavLinkClass}>Rooms</NavLink>
            <NavLink to="/tours" className={getDesktopNavLinkClass}>Tours</NavLink>
            <NavLink to="/contact" className={getDesktopNavLinkClass}>Contact</NavLink>
            {user && user.role === 'admin' && (
              <NavLink to="/admin/dashboard" className={getDesktopNavLinkClass}>Admin</NavLink>
            )}
            <div className="border-l border-gray-300 h-6"></div>

            {/* Auth section (Login/Logout) remains the same */}
            {user ? (
              <div className="ml-4 flex items-center space-x-4">
                <Link to="/my-profile" className="flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                  <img className="h-8 w-8 rounded-full mr-2 object-cover" src={getAvatarUrl()} alt="User Avatar" />
                  Welcome, {user.name.split(' ')[0]}!
                </Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-gray-900 text-sm font-medium">
                  Logout
                </button>
              </div>
            ) : (
              <div className="ml-4 flex items-center">
                <Link to="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                <Link to="/signup" className="ml-2 inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button (remains the same) */}
          <div className="md:hidden flex items-center">
            <button
              id="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path></svg>
              <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* --- 4. Mobile Menu uses NavLink --- */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NavLink to="/" className={getMobileNavLinkClass} end>Home</NavLink>
          <NavLink to="/rooms" className={getMobileNavLinkClass}>Rooms</NavLink>
          <NavLink to="/tours" className={getMobileNavLinkClass}>Tours</NavLink>
          <NavLink to="/contact" className={getMobileNavLinkClass}>Contact</NavLink>
          {user && user.role === 'admin' && (
            <NavLink to="/admin/dashboard" className={getMobileNavLinkClass}>Admin</NavLink>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="px-2 space-y-1">
            {/* Auth section for mobile (remains the same) */}
            {user ? (
              <>
                <Link to="/my-profile" className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">My Profile</Link>
                <button onClick={handleLogout} className="w-full text-left text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">Login</Link>
                <Link to="/signup" className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;