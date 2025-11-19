const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const adminReportsController = require('../controllers/adminReportsController');
const adminInvoiceController = require('../controllers/adminInvoiceController');

// All routes require authentication and admin role
router.use(protect, admin);

// Test route to verify admin routes are loaded
router.get('/test', (req, res) => res.json({ message: 'Admin routes are working!' }));

// ===================================
// DASHBOARD
// ===================================
router.get('/dashboard', adminController.getDashboard);

// ===================================
// GUEST/USER MANAGEMENT
// ===================================
router.get('/guests', adminController.getGuests);
router.get('/guests/:id', adminController.getGuestById);
router.delete('/guests/:id', adminController.deleteGuest);
router.put('/guests/:id/crm', adminController.updateGuestCRM);
router.post('/guests/:id/refresh-metrics', adminController.refreshGuestMetrics);

// ===================================
// CRM
// ===================================
router.get('/crm', adminController.getCRMDashboard);
router.get('/crm/export-marketing', adminController.exportMarketingList);

// ===================================
// REPORTS & ANALYTICS
// ===================================
router.get('/reports', adminReportsController.getReports);
router.get('/reports/export-bookings', adminReportsController.exportBookings);

// ===================================
// BOOKING STATUS MANAGEMENT
// ===================================
router.put('/bookings/:id/status', adminReportsController.updateBookingStatus);
router.put('/tour-bookings/:id/status', adminReportsController.updateTourBookingStatus);

// ===================================
// RESOURCE MANAGEMENT
// ===================================
router.get('/resources/calendar', adminReportsController.getResourceCalendar);
router.get('/resources', adminReportsController.getResources);
router.post('/resources', adminReportsController.createResource);
router.put('/resources/:id', adminReportsController.updateResource);
router.delete('/resources/:id', adminReportsController.deleteResource);

// Resource scheduling
router.delete('/resource-schedules/:id', adminReportsController.unassignResource);

// ===================================
// INVOICE MANAGEMENT
// ===================================
router.get('/invoices', adminInvoiceController.getInvoices);
router.get('/invoices/stats', adminInvoiceController.getInvoiceStats);
router.get('/invoices/:id/pdf', adminInvoiceController.generateInvoicePDF);
router.get('/invoices/:id', adminInvoiceController.getInvoiceById);
router.post('/invoices/booking/:bookingId', adminInvoiceController.createBookingInvoice);
router.post('/invoices/tour-booking/:tourBookingId', adminInvoiceController.createTourBookingInvoice);
router.put('/invoices/:id/mark-paid', adminInvoiceController.markInvoicePaid);
router.post('/invoices/:id/items', adminInvoiceController.addInvoiceItem);
router.delete('/invoice-items/:id', adminInvoiceController.deleteInvoiceItem);

// ===================================
// ROOM MANAGEMENT
// ===================================
router.get('/rooms', adminController.getAllRooms);
router.post('/rooms', adminController.createRoom);
router.put('/rooms/:id', adminController.updateRoom);
router.delete('/rooms/:id', adminController.deleteRoom);

// ===================================
// BOOKING MANAGEMENT
// ===================================
router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/unassigned', adminController.getUnassignedBookings);
router.put('/bookings/:id/assign-room', adminController.assignRoomToBooking);
router.get('/rooms/available', adminController.getAvailableRoomsForAssignment);

// Tour booking routes - specific routes FIRST
router.get('/tour-bookings/:id/resources', adminReportsController.getTourBookingResources);
router.post('/tour-bookings/:id/resources', adminReportsController.assignResource);
router.get('/tour-bookings/:id', (req, res, next) => {
    console.log('Route matched: GET /api/admin/tour-bookings/:id with id =', req.params.id);
    next();
}, adminController.getTourBookingById);
router.get('/tour-bookings', adminController.getAllTourBookings);

console.log('Admin routes registered: bookings, tour-bookings, rooms, front-desk');

module.exports = router;
