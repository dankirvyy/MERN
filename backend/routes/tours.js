const express = require('express');
const router = express.Router();
const {
    getAllTours,
    getTourById,
    createTour,
    updateTour,
    deleteTour,
} = require('../controllers/tourController');

// Public routes
router.get('/', getAllTours);
router.get('/:id', getTourById);

// Admin routes
router.post('/', createTour);
router.put('/:id', updateTour);
router.delete('/:id', deleteTour);

// --- THIS IS THE CRITICAL LINE ---
module.exports = router;