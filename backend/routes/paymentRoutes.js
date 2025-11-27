const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const PayMongoService = require('../utils/paymongoService');
const PayPalService = require('../utils/paypalService');

// @desc    Create GCash payment source (for room booking)
// @route   POST /api/payment/gcash/create-source/room
// @access  Private
router.post('/gcash/create-source/room', protect, async (req, res) => {
    try {
        const { amount, booking_data, guest_data } = req.body;

        if (!amount || !booking_data) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const paymongo = new PayMongoService();
        
        // First create the source
        const source = await paymongo.createSource({
            type: 'gcash',
            amount: parseInt(amount * 100), // Convert to cents
            currency: 'PHP',
            redirect: {
                success: process.env.FRONTEND_URL + '/payment/success/room?source_id=' + '{SOURCE_ID}',
                failed: process.env.FRONTEND_URL + '/payment/failed/room?source_id=' + '{SOURCE_ID}'
            },
            billing: {
                name: `${guest_data.first_name} ${guest_data.last_name}`,
                email: guest_data.email,
                phone: guest_data.phone_number
            }
        });

        // Return checkout URL with source_id appended
        const checkoutUrl = source.attributes.redirect.checkout_url;
        res.json({
            success: true,
            source_id: source.id,
            checkout_url: checkoutUrl
        });
    } catch (error) {
        console.error('GCash source creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create GCash payment source (for tour booking)
// @route   POST /api/payment/gcash/create-source/tour
// @access  Private
router.post('/gcash/create-source/tour', protect, async (req, res) => {
    try {
        const { amount, booking_data, guest_data } = req.body;

        if (!amount || !booking_data) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const paymongo = new PayMongoService();
        
        // First create the source
        const source = await paymongo.createSource({
            type: 'gcash',
            amount: parseInt(amount * 100), // Convert to cents
            currency: 'PHP',
            redirect: {
                success: process.env.FRONTEND_URL + '/payment/success/tour?source_id=' + '{SOURCE_ID}',
                failed: process.env.FRONTEND_URL + '/payment/failed/tour?source_id=' + '{SOURCE_ID}'
            },
            billing: {
                name: `${guest_data.first_name} ${guest_data.last_name}`,
                email: guest_data.email,
                phone: guest_data.phone_number
            }
        });

        // Return checkout URL with source_id appended
        const checkoutUrl = source.attributes.redirect.checkout_url;
        res.json({
            success: true,
            source_id: source.id,
            checkout_url: checkoutUrl
        });
    } catch (error) {
        console.error('GCash source creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Verify GCash payment source
// @route   POST /api/payment/gcash/verify
// @access  Private
router.post('/gcash/verify', protect, async (req, res) => {
    try {
        const { source_id, amount } = req.body;

        console.log('Verifying GCash payment:', { source_id, amount });

        if (!source_id) {
            return res.status(400).json({ message: 'Missing source ID' });
        }

        const paymongo = new PayMongoService();
        
        // Step 1: Retrieve the source to check if it's chargeable
        console.log('Retrieving source from PayMongo...');
        const source = await paymongo.retrieveSource(source_id);
        console.log('Source status:', source.attributes.status);
        
        if (source.attributes.status !== 'chargeable') {
            console.log('Source not chargeable, status:', source.attributes.status);
            return res.status(400).json({ 
                message: 'Payment source is not chargeable',
                status: source.attributes.status
            });
        }

        // Step 2: Create a payment from the chargeable source
        console.log('Creating payment from source...');
        const payment = await paymongo.createPayment({
            amount: source.attributes.amount, // Use the exact amount from the source
            currency: 'PHP',
            description: 'Visit Mindoro Booking',
            source: {
                id: source.id,
                type: 'source'
            }
        });

        console.log('Payment created successfully:', payment.id);
        res.json({
            success: true,
            payment_id: payment.id,
            status: payment.attributes.status,
            amount: payment.attributes.amount / 100 // Convert back to PHP
        });
    } catch (error) {
        console.error('GCash verification error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ 
            message: error.message || 'Payment verification failed',
            error: error.toString()
        });
    }
});

// @desc    Verify PayPal payment (for room booking)
// @route   POST /api/payment/paypal/verify/room
// @access  Private
router.post('/paypal/verify/room', protect, async (req, res) => {
    try {
        const { order_id, amount } = req.body;

        if (!order_id || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const paypal = new PayPalService();
        const verification = await paypal.verifyOrder(order_id, amount);

        res.json({
            success: true,
            verified: verification.verified,
            order_id: verification.orderId
        });
    } catch (error) {
        console.error('PayPal verification error:', error);
        res.status(400).json({ message: error.message });
    }
});

// @desc    Verify PayPal payment (for tour booking)
// @route   POST /api/payment/paypal/verify/tour
// @access  Private
router.post('/paypal/verify/tour', protect, async (req, res) => {
    try {
        const { order_id, amount } = req.body;

        if (!order_id || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const paypal = new PayPalService();
        const verification = await paypal.verifyOrder(order_id, amount);

        res.json({
            success: true,
            verified: verification.verified,
            order_id: verification.orderId
        });
    } catch (error) {
        console.error('PayPal verification error:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
