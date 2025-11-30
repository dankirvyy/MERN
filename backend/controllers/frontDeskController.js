const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const User = require('../models/User');
const { Op } = require('sequelize');
const { sendRoomAssignmentNotification } = require('../utils/emailService');

// @desc    Get front desk dashboard data
// @route   GET /api/frontdesk/dashboard
// @access  Private/FrontDesk
exports.getDashboard = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Get pending room assignments (bookings without room_id)
        const unassignedBookings = await Booking.findAll({
            where: {
                room_id: null,
                status: 'pending'
            },
            include: [
                {
                    model: User,
                    as: 'Guest',
                    attributes: ['first_name', 'last_name', 'email', 'phone_number']
                },
                {
                    model: RoomType,
                    attributes: ['name']
                }
            ],
            order: [['check_in_date', 'ASC']]
        });

        console.log('Unassigned bookings found:', unassignedBookings.length);

        // Get today's check-ins
        const todaysCheckins = await Booking.findAll({
            where: {
                check_in_date: today,
                status: 'confirmed'
            },
            include: [
                {
                    model: User,
                    as: 'Guest',
                    attributes: ['first_name', 'last_name']
                },
                {
                    model: Room,
                    include: {
                        model: RoomType,
                        as: 'RoomType',
                        attributes: ['name']
                    }
                },
                {
                    model: RoomType,
                    attributes: ['name']
                }
            ],
            order: [['check_in_time', 'ASC']]
        });

        // Get today's check-outs
        const todaysCheckouts = await Booking.findAll({
            where: {
                check_out_date: today,
                status: 'confirmed'
            },
            include: [
                {
                    model: User,
                    as: 'Guest',
                    attributes: ['first_name', 'last_name']
                },
                {
                    model: Room,
                    include: {
                        model: RoomType,
                        as: 'RoomType',
                        attributes: ['name']
                    }
                },
                {
                    model: RoomType,
                    attributes: ['name']
                }
            ],
            order: [['check_out_time', 'ASC']]
        });

        res.json({
            unassignedBookings,
            todaysCheckins,
            todaysCheckouts
        });
    } catch (error) {
        console.error('Front desk dashboard error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get available rooms for assignment
// @route   GET /api/frontdesk/available-rooms/:roomTypeId
// @access  Private/FrontDesk
exports.getAvailableRooms = async (req, res) => {
    try {
        const { roomTypeId } = req.params;
        const { checkIn, checkOut } = req.query;

        // If dates are provided, use date-based availability checking
        if (checkIn && checkOut) {
            const { getAvailableRoomsByType } = require('../utils/availabilityUtils');
            const rooms = await getAvailableRoomsByType(roomTypeId, checkIn, checkOut);
            return res.json({ rooms });
        }

        // Fallback: Get all rooms of this type (for backwards compatibility)
        const rooms = await Room.findAll({
            where: {
                room_type_id: roomTypeId
            },
            include: {
                model: RoomType,
                as: 'RoomType',
                attributes: ['name', 'capacity', 'base_price']
            },
            order: [['room_number', 'ASC']]
        });

        res.json({ rooms });
    } catch (error) {
        console.error('Get available rooms error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Assign room to booking
// @route   POST /api/frontdesk/assign-room
// @access  Private/FrontDesk
exports.assignRoom = async (req, res) => {
    try {
        const { bookingId, roomId } = req.body;

        // Get the booking
        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if room exists
        const room = await Room.findByPk(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if room is available for the booking dates
        const { isRoomAvailable } = require('../utils/availabilityUtils');
        const available = await isRoomAvailable(
            roomId,
            booking.check_in_date,
            booking.check_out_date,
            booking.id // Exclude current booking
        );

        if (!available) {
            return res.status(400).json({ 
                message: 'This room is already booked for these dates. Please choose a different room.' 
            });
        }

        // Check for conflicts
        const conflict = await Booking.findOne({
            where: {
                room_id: roomId,
                status: 'confirmed',
                [Op.or]: [
                    {
                        [Op.and]: [
                            { check_in_date: { [Op.lte]: booking.check_out_date } },
                            { check_out_date: { [Op.gte]: booking.check_in_date } }
                        ]
                    }
                ]
            }
        });

        if (conflict) {
            return res.status(400).json({ 
                message: 'This room has a conflicting booking for the selected dates' 
            });
        }

        // Assign the room and confirm the booking
        await booking.update({ 
            room_id: roomId,
            status: 'confirmed' // Front desk confirms when assigning room
        });
        await room.update({ status: 'occupied' });

        const updatedBooking = await Booking.findByPk(bookingId, {
            include: [
                {
                    model: Room,
                    include: { model: RoomType, as: 'RoomType' }
                },
                {
                    model: User,
                    as: 'Guest',
                    attributes: ['first_name', 'last_name', 'email']
                }
            ]
        });

        // Send room assignment notification email
        try {
            console.log('📧 Attempting to send room assignment email to:', updatedBooking.Guest.email);
            
            const assignmentDetails = {
                'Booking ID': updatedBooking.id,
                'Room Number': updatedBooking.Room.room_number,
                'Room Type': updatedBooking.Room.RoomType.name,
                'Check-in Date': new Date(updatedBooking.check_in_date).toLocaleDateString(),
                'Check-out Date': new Date(updatedBooking.check_out_date).toLocaleDateString(),
                'Check-in Time': updatedBooking.check_in_time || '2:00 PM',
                'Check-out Time': updatedBooking.check_out_time || '12:00 PM'
            };

            await sendRoomAssignmentNotification(
                updatedBooking.Guest.email,
                `${updatedBooking.Guest.first_name} ${updatedBooking.Guest.last_name}`,
                assignmentDetails
            );
            console.log('✅ Room assignment email sent successfully!');
        } catch (emailError) {
            console.error('❌ Failed to send room assignment email:', emailError);
            // Don't fail the assignment if email fails
        }

        res.json({
            message: 'Room assigned successfully',
            booking: updatedBooking
        });
    } catch (error) {
        console.error('Assign room error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = exports;
