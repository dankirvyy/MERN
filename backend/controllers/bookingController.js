const Booking = require('../models/Booking');
const TourBooking = require('../models/TourBooking');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Tour = require('../models/Tour');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const InvoiceItem = require('../models/InvoiceItem');
const { Op } = require('sequelize');
const { sendBookingConfirmation, sendTourBookingConfirmation } = require('../utils/emailService');

// @desc    Get logged-in user's room bookings
// @route   GET /api/bookings/my-rooms
exports.getMyRoomBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { guest_id: req.user.id }, // req.user comes from authMiddleware
            order: [['check_in_date', 'DESC']],
            // This is the SQL JOIN
            include: [
                {
                    model: Room,
                    required: false, // LEFT JOIN to handle null room_id
                    include: {
                        model: RoomType,
                        attributes: ['name']
                    }
                },
                {
                    model: RoomType,
                    attributes: ['name']
                }
            ]
        });

        // Format the data to match the PHP structure
        const formattedBookings = bookings.map(b => ({
            id: b.id,
            room_number: b.Room ? b.Room.room_number : 'Not Assigned Yet',
            room_type_name: b.RoomType ? b.RoomType.name : (b.Room ? b.Room.RoomType.name : 'Unknown'),
            check_in_date: b.check_in_date,
            check_out_date: b.check_out_date,
            status: b.status,
            total_price: b.total_price
        }));

        res.json(formattedBookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get logged-in user's tour bookings
// @route   GET /api/bookings/my-tours
exports.getMyTourBookings = async (req, res) => {
    try {
        const bookings = await TourBooking.findAll({
            where: { guest_id: req.user.id },
            order: [['booking_date', 'DESC']],
            include: { // SQL JOIN
                model: Tour,
                attributes: ['name'] // We only need the tour's name
            }
        });
        
        // Format the data
        const formattedBookings = bookings.map(b => ({
            id: b.id,
            tour_name: b.Tour.name,
            booking_date: b.booking_date,
            number_of_pax: b.number_of_pax,
            status: b.status,
            total_price: b.total_price
        }));

        res.json(formattedBookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.createRoomBooking = async (req, res) => {
    try {
        const { 
            room_type_id,
            check_in_date, 
            check_out_date,
            check_in_time,
            check_out_time,
            total_price,
            payment_method, // 'paypal' or 'gcash'
            payment_id      // e.g., PayPal Order ID
        } = req.body;
        
        const guest_id = req.user.id; // From our 'protect' middleware

        // Check if guest already has an active booking (pending or confirmed)
        const existingBooking = await Booking.findOne({
            where: {
                guest_id: guest_id,
                status: { [Op.in]: ['pending', 'confirmed'] }
            }
        });

        if (existingBooking) {
            return res.status(400).json({ 
                message: 'You already have an active booking. Please wait until it is completed or cancelled before making a new reservation.' 
            });
        }

        // 1. Create the booking without room assignment - status is 'pending' until front desk assigns room
        const booking = await Booking.create({
            guest_id: guest_id,
            room_type_id: room_type_id,
            room_id: null, // Will be assigned by front desk
            check_in_date: check_in_date,
            check_out_date: check_out_date,
            check_in_time: check_in_time || '14:00:00',
            check_out_time: check_out_time || '12:00:00',
            total_price: total_price,
            status: 'pending', // Pending until front desk assigns room and confirms
            payment_status: 'paid',
            amount_paid: total_price,
            balance_due: 0
        });

        // 2. Send booking confirmation email
        try {
            const user = await User.findByPk(guest_id);
            const roomType = await RoomType.findByPk(room_type_id);
            
            const bookingDetails = {
                'Booking ID': booking.id,
                'Room Type': roomType.name,
                'Check-in Date': new Date(check_in_date).toLocaleDateString(),
                'Check-out Date': new Date(check_out_date).toLocaleDateString(),
                'Check-in Time': check_in_time || '2:00 PM',
                'Check-out Time': check_out_time || '12:00 PM',
                'Total Amount': `₱${total_price.toLocaleString()}`,
                'Payment Status': 'Paid',
                'Status': 'Pending Room Assignment'
            };

            await sendBookingConfirmation(
                user.email,
                `${user.first_name} ${user.last_name}`,
                bookingDetails
            );
        } catch (emailError) {
            console.error('Failed to send booking confirmation email:', emailError);
            // Don't fail the booking if email fails
        }

        // 3. Create invoice for the booking
        try {
            const dueDate = new Date(check_in_date);
            const invoice = await Invoice.create({
                booking_id: booking.id,
                issue_date: new Date(),
                due_date: dueDate,
                total_amount: total_price,
                status: 'paid'
            });

            // Create invoice item for the room booking
            await InvoiceItem.create({
                invoice_id: invoice.id,
                description: `${roomType.name} - Room Booking`,
                quantity: 1,
                unit_price: total_price,
                total: total_price
            });

            console.log('✅ Invoice created for booking ID:', booking.id, 'Invoice ID:', invoice.id);
        } catch (invoiceError) {
            console.error('❌ Failed to create invoice:', invoiceError.message);
            console.error('Full error:', invoiceError);
            // Don't fail the booking if invoice creation fails
        }

        res.status(201).json(booking);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a new tour booking (after payment)
// @route   POST /api/bookings/tour
exports.createTourBooking = async (req, res) => {
    try {
        const {
            tour_id,
            booking_date,
            number_of_pax,
            total_price,
            payment_method,
            payment_id
        } = req.body;

        const guest_id = req.user.id; // From our 'protect' middleware

        // Check if guest already has an active tour booking (pending or confirmed)
        const existingTourBooking = await TourBooking.findOne({
            where: {
                guest_id: guest_id,
                status: { [Op.in]: ['pending', 'confirmed'] }
            }
        });

        if (existingTourBooking) {
            return res.status(400).json({ 
                message: 'You already have an active tour booking. Please wait until it is completed or cancelled before making a new reservation.' 
            });
        }

        // In a real app, you might check if the tour is available
        // For now, we'll just create the booking
        
        const booking = await TourBooking.create({
            guest_id: guest_id,
            tour_id: tour_id,
            booking_date: booking_date,
            number_of_pax: number_of_pax,
            total_price: total_price,
            status: 'pending', // Pending until admin confirms
            payment_status: 'paid',
            amount_paid: total_price,
            balance_due: 0
        });

        // 4. Send tour booking confirmation email
        try {
            console.log('📧 Preparing to send tour booking confirmation email...');
            const user = await User.findByPk(guest_id);
            const tour = await Tour.findByPk(tour_id);
            
            console.log('User email:', user.email);
            console.log('Tour name:', tour.name);
            
            const tourDetails = {
                'Booking ID': booking.id,
                'Tour Name': tour.name,
                'Booking Date': new Date(booking_date).toLocaleDateString(),
                'Number of Guests': number_of_pax,
                'Price per Person': `₱${tour.price_per_person.toLocaleString()}`,
                'Total Amount': `₱${total_price.toLocaleString()}`,
                'Payment Status': 'Paid',
                'Status': 'Pending Confirmation'
            };

            console.log('Calling sendTourBookingConfirmation...');
            await sendTourBookingConfirmation(
                user.email,
                `${user.first_name} ${user.last_name}`,
                tourDetails
            );
            console.log('✅ Tour booking confirmation email sent successfully!');
        } catch (emailError) {
            console.error('❌ Failed to send tour booking confirmation email:', emailError);
            console.error('Error details:', emailError.message);
            // Don't fail the booking if email fails
        }

        // 5. Create invoice for the tour booking
        try {
            const tour = await Tour.findByPk(tour_id);
            const dueDate = new Date(booking_date);
            const invoice = await Invoice.create({
                tour_booking_id: booking.id,
                issue_date: new Date(),
                due_date: dueDate,
                total_amount: total_price,
                status: 'paid'
            });

            // Create invoice item for the tour
            await InvoiceItem.create({
                invoice_id: invoice.id,
                description: `${tour.name} - Tour Booking`,
                quantity: number_of_pax,
                unit_price: tour.price_per_person,
                total: total_price
            });

            console.log('✅ Invoice created for tour booking ID:', booking.id, 'Invoice ID:', invoice.id);
        } catch (invoiceError) {
            console.error('❌ Failed to create invoice:', invoiceError.message);
            console.error('Full error:', invoiceError);
            // Don't fail the booking if invoice creation fails
        }

        res.status(201).json(booking);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'Guest',
                    attributes: ['first_name', 'last_name', 'email', 'phone_number']
                },
                {
                    model: RoomType,
                    attributes: ['name', 'id']
                },
                {
                    model: Room,
                    required: false,
                    include: {
                        model: RoomType,
                        attributes: ['name']
                    }
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Get booking by ID error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Cancel a room booking
// @route   PATCH /api/bookings/room/:id/cancel
exports.cancelRoomBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            where: { 
                id: req.params.id,
                guest_id: req.user.id // Ensure user can only cancel their own bookings
            }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow cancellation of pending bookings
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        console.error('Cancel room booking error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Cancel a tour booking
// @route   PATCH /api/bookings/tour/:id/cancel
exports.cancelTourBooking = async (req, res) => {
    try {
        const booking = await TourBooking.findOne({
            where: { 
                id: req.params.id,
                guest_id: req.user.id // Ensure user can only cancel their own bookings
            }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow cancellation of pending bookings
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        console.error('Cancel tour booking error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};