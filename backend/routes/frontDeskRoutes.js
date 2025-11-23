const express = require('express');
const router = express.Router();
const { protect, frontDeskOnly } = require('../middleware/authMiddleware');
const {
    getDashboard,
    getAvailableRooms,
    assignRoom
} = require('../controllers/frontDeskController');

// All routes require authentication and front desk role
router.use(protect);
router.use(frontDeskOnly);

router.get('/dashboard', getDashboard);
router.get('/available-rooms/:roomTypeId', getAvailableRooms);
router.post('/assign-room', assignRoom);

module.exports = router;
