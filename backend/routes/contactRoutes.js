const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route - Submit contact form
router.post('/submit', contactController.submitContact);

// Admin routes - Manage contact submissions
router.get('/all', protect, admin, contactController.getAllContacts);
router.patch('/:id/status', protect, admin, contactController.updateContactStatus);
router.delete('/:id', protect, admin, contactController.deleteContact);

module.exports = router;
