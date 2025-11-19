const express = require('express');
const router = express.Router();
const {
    getAllTours,
    getTourById,
    createTour,
    updateTour,
    deleteTour,
    upload
} = require('../controllers/tourController');

// Public routes
router.get('/', getAllTours);
router.get('/:id', getTourById);

// Admin routes
router.post('/', upload.single('image'), createTour);
router.put('/:id', upload.single('image'), updateTour);
router.delete('/:id', deleteTour);

// --- THIS IS THE CRITICAL LINE ---
module.exports = router;