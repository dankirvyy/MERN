const express = require('express');
const router = express.Router();

const { 
    getMyRoomBookings, 
    getMyTourBookings,
    createRoomBooking,
    createTourBooking,
    getBookingById
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');

// Get My Bookings
router.get('/my-rooms', protect, getMyRoomBookings);
router.get('/my-tours', protect, getMyTourBookings);

// Get specific booking by ID
router.get('/:id', protect, getBookingById);

// Create New Booking
router.post('/room', protect, createRoomBooking);
router.post('/tour', protect, createTourBooking);

module.exports = router;