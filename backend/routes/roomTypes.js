const express = require('express');
const router = express.Router();
const { 
    getAllRoomTypes, 
    getRoomTypeById, 
    getAvailableRooms,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    upload
} = require('../controllers/roomTypeController');

// Public route to get all room types
router.get('/', getAllRoomTypes);

// Public route to get a single room type
router.get('/:id', getRoomTypeById);

// Public route to get available rooms for that type
router.get('/:id/available', getAvailableRooms);

// Admin routes (should be protected but for now they're open)
router.post('/', upload.single('image'), createRoomType);
router.put('/:id', upload.single('image'), updateRoomType);
router.delete('/:id', deleteRoomType);

module.exports = router;