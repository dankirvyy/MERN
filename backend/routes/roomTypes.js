const express = require('express');
const router = express.Router();
const { 
    getAllRoomTypes, 
    getRoomTypeById, 
    getAvailableRooms 
} = require('../controllers/roomTypeController');

// Public route to get all room types
router.get('/', getAllRoomTypes);

// Public route to get a single room type
router.get('/:id', getRoomTypeById);

// Public route to get available rooms for that type
router.get('/:id/available', getAvailableRooms);

module.exports = router;