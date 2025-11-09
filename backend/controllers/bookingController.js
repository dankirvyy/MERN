const Booking = require('../models/Booking');
const TourBooking = require('../models/TourBooking');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Tour = require('../models/Tour');
const { Op } = require('sequelize');

// @desc    Get logged-in user's room bookings
// @route   GET /api/bookings/my-rooms
exports.getMyRoomBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { guest_id: req.user.id }, // req.user comes from authMiddleware
            order: [['check_in_date', 'DESC']],
            // This is the SQL JOIN
            include: {
                model: Room,
                include: {
                    model: RoomType,
                    attributes: ['name'] // We only need the room type's name
                }
            }
        });

        // Format the data to match the PHP structure
        const formattedBookings = bookings.map(b => ({
            id: b.id,
            room_number: b.Room.room_number,
            room_type_name: b.Room.RoomType.name,
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
            room_id, 
            check_in_date, 
            check_out_date,
            total_price,
            payment_method, // 'paypal' or 'gcash'
            payment_id      // e.g., PayPal Order ID
        } = req.body;
        
        const guest_id = req.user.id; // From our 'protect' middleware

        // 1. Check if room is still available
        const room = await Room.findByPk(room_id);
        if (!room) {
            return res.status(404).json({ message: 'Selected room not found' });
        }
        if (room.status !== 'available') {
             return res.status(400).json({ message: 'Room is no longer available. Please try again.' });
        }

        // 2. Create the booking
        const booking = await Booking.create({
            guest_id: guest_id,
            room_id: room_id,
            check_in_date: check_in_date,
            check_out_date: check_out_date,
            total_price: total_price,
            status: 'confirmed' // Payment was successful
        });

        // 3. Update the room status to 'occupied'
        room.status = 'occupied';
        await room.save();
        
        // 4. (Future): We would also save the payment_id to an 'invoices' table

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

        // In a real app, you might check if the tour is available
        // For now, we'll just create the booking
        
        const booking = await TourBooking.create({
            guest_id: guest_id,
            tour_id: tour_id,
            booking_date: booking_date,
            number_of_pax: number_of_pax,
            total_price: total_price,
            status: 'confirmed'
        });

        // 4. (Future): Save payment_id to an 'invoices' table

        res.status(201).json(booking);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};