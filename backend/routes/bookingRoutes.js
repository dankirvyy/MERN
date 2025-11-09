const express = require('express');
const router = express.Router();

// --- THIS IS THE FIX ---
// You were missing 'createRoomBooking' from this list
const { 
    getMyRoomBookings, 
    getMyTourBookings,
    createRoomBooking,
    createTourBooking
} = require('../controllers/bookingController');
// --- END FIX ---

const { protect } = require('../middleware/authMiddleware');

// Get My Bookings
router.get('/my-rooms', protect, getMyRoomBookings);
router.get('/my-tours', protect, getMyTourBookings);

// Create New Booking
router.post('/room', protect, createRoomBooking);
router.post('/tour', protect, createTourBooking);

module.exports = router;