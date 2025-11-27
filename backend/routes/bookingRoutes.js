const express = require('express');
const router = express.Router();

const { 
    getMyRoomBookings, 
    getMyTourBookings,
    createRoomBooking,
    createTourBooking,
    getBookingById,
    cancelRoomBooking,
    cancelTourBooking
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

// Cancel Booking
router.patch('/room/:id/cancel', protect, cancelRoomBooking);
router.patch('/tour/:id/cancel', protect, cancelTourBooking);

module.exports = router;