const express = require('express');
const router = express.Router();
const { getAvailabilityByRoomType, getAvailableRoomsByType } = require('../utils/availabilityUtils');

// @desc    Check availability for all room types for given dates
// @route   GET /api/availability/check?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
// @access  Public
router.get('/check', async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({ 
                message: 'Check-in and check-out dates are required',
                example: '/api/availability/check?checkIn=2025-12-01&checkOut=2025-12-04'
            });
        }

        // Validate dates
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        if (checkInDate < today) {
            return res.status(400).json({ message: 'Check-in date cannot be in the past' });
        }

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: 'Check-out date must be after check-in date' });
        }

        const availability = await getAvailabilityByRoomType(checkIn, checkOut);

        res.json({
            checkIn,
            checkOut,
            availability: Object.values(availability)
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ message: 'Error checking availability', error: error.message });
    }
});

// @desc    Check availability for specific room type
// @route   GET /api/availability/room-type/:roomTypeId?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
// @access  Public
router.get('/room-type/:roomTypeId', async (req, res) => {
    try {
        const { roomTypeId } = req.params;
        const { checkIn, checkOut } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: 'Check-in and check-out dates are required' });
        }

        // Validate dates
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        if (checkInDate < today) {
            return res.status(400).json({ message: 'Check-in date cannot be in the past' });
        }

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: 'Check-out date must be after check-in date' });
        }

        const availableRooms = await getAvailableRoomsByType(roomTypeId, checkIn, checkOut);

        res.json({
            roomTypeId: parseInt(roomTypeId),
            checkIn,
            checkOut,
            availableCount: availableRooms.length,
            availableRooms
        });
    } catch (error) {
        console.error('Error checking room type availability:', error);
        res.status(500).json({ message: 'Error checking availability', error: error.message });
    }
});

module.exports = router;
