const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('../models/User');
const Booking = require('../models/Booking');
const TourBooking = require('../models/TourBooking');
const Tour = require('../models/Tour');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Invoice = require('../models/Invoice');
const InvoiceItem = require('../models/InvoiceItem');
const Resource = require('../models/Resource');
const ResourceSchedule = require('../models/ResourceSchedule');

// ===================================
// DASHBOARD
// ===================================

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res) => {
    try {
        // Overview counts
        const tourCount = await Tour.count();
        const roomCount = await Room.count();
        const activeBookingCount = await Booking.count({
            where: {
                status: { [Op.notIn]: ['completed', 'cancelled'] }
            }
        });
        const resourceCount = await Resource.count({ where: { is_available: true } });
        const tourBookingCount = await TourBooking.count({
            where: {
                status: { [Op.notIn]: ['cancelled', 'pending'] }
            }
        });

        // Booking type chart data (doughnut)
        const roomBookingsTotal = await Booking.count({
            where: {
                status: { [Op.notIn]: ['cancelled', 'pending'] }
            }
        });
        
        const tourBookingsTotal = await TourBooking.count({
            where: {
                status: { [Op.notIn]: ['cancelled', 'pending'] }
            }
        });

        // Revenue data for last 7 days (line chart)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const revenueData = await Booking.findAll({
            attributes: [
                [fn('DATE', col('check_in_date')), 'booking_date'],
                [fn('SUM', col('total_price')), 'daily_total']
            ],
            where: {
                status: { [Op.in]: ['confirmed', 'completed'] },
                check_in_date: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            group: [fn('DATE', col('check_in_date'))],
            order: [[fn('DATE', col('check_in_date')), 'ASC']],
            raw: true
        });

        // Format revenue data for chart
        const lineChartLabels = [];
        const lineChartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            lineChartLabels.push(formattedDate);
            
            const dayData = revenueData.find(r => r.booking_date === dateStr);
            lineChartData.push(dayData ? parseFloat(dayData.daily_total) : 0);
        }

        res.json({
            overview: {
                tourCount,
                roomCount,
                activeBookingCount,
                resourceCount,
                tourBookingCount
            },
            charts: {
                doughnut: {
                    labels: ['Room Bookings', 'Tour Bookings'],
                    data: [roomBookingsTotal, tourBookingsTotal]
                },
                line: {
                    labels: lineChartLabels,
                    data: lineChartData
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ===================================
// GUEST/USER MANAGEMENT
// ===================================

// @desc    Get all guests/users
// @route   GET /api/admin/guests
// @access  Private/Admin
exports.getGuests = async (req, res) => {
    try {
        const { search } = req.query;
        
        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    { first_name: { [Op.like]: `%${search}%` } },
                    { last_name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const guests = await User.findAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']]
        });

        res.json(guests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single guest details
// @route   GET /api/admin/guests/:id
// @access  Private/Admin
exports.getGuestById = async (req, res) => {
    try {
        const guest = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }

        // Get all bookings for this guest
        const roomBookings = await Booking.findAll({
            where: { guest_id: req.params.id },
            include: [
                {
                    model: Room,
                    include: [{ model: RoomType }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        const tourBookings = await TourBooking.findAll({
            where: { guest_id: req.params.id },
            include: [{ model: Tour }],
            order: [['created_at', 'DESC']]
        });

        // Calculate total spent
        const totalRoom = await Booking.sum('total_price', {
            where: {
                guest_id: req.params.id,
                status: 'confirmed'
            }
        }) || 0;

        const totalTour = await TourBooking.sum('total_price', {
            where: {
                guest_id: req.params.id,
                status: 'confirmed'
            }
        }) || 0;

        res.json({
            guest,
            roomBookings,
            tourBookings,
            totalSpent: parseFloat(totalRoom) + parseFloat(totalTour)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a guest
// @route   DELETE /api/admin/guests/:id
// @access  Private/Admin
exports.deleteGuest = async (req, res) => {
    try {
        const hasBookings = await Booking.count({ where: { guest_id: req.params.id } }) > 0;
        const hasTourBookings = await TourBooking.count({ where: { guest_id: req.params.id } }) > 0;

        if (hasBookings || hasTourBookings) {
            return res.status(400).json({ 
                message: 'Cannot delete guest with existing bookings. Cancel bookings first.' 
            });
        }

        await User.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Guest deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update guest CRM data
// @route   PUT /api/admin/guests/:id/crm
// @access  Private/Admin
exports.updateGuestCRM = async (req, res) => {
    try {
        const { guest_type, notes, tags, marketing_consent, birthday, address, country } = req.body;

        const guest = await User.findByPk(req.params.id);
        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }

        await guest.update({
            guest_type,
            notes,
            tags,
            marketing_consent,
            birthday,
            address,
            country
        });

        res.json({ message: 'Guest CRM data updated successfully', guest });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Refresh guest metrics
// @route   POST /api/admin/guests/:id/refresh-metrics
// @access  Private/Admin
exports.refreshGuestMetrics = async (req, res) => {
    try {
        const guestId = req.params.id;

        // Calculate from bookings
        const bookingStats = await Booking.findOne({
            attributes: [
                [fn('COUNT', col('id')), 'visit_count'],
                [fn('MAX', col('check_out_date')), 'last_visit'],
                [fn('SUM', col('total_price')), 'revenue']
            ],
            where: {
                guest_id: guestId,
                status: 'completed'
            },
            raw: true
        });

        // Calculate from tour bookings
        const tourStats = await TourBooking.findOne({
            attributes: [
                [fn('COUNT', col('id')), 'tour_count'],
                [fn('MAX', col('booking_date')), 'last_tour'],
                [fn('SUM', col('total_price')), 'tour_revenue']
            ],
            where: {
                guest_id: guestId,
                status: 'completed'
            },
            raw: true
        });

        const totalVisits = parseInt(bookingStats?.visit_count || 0) + parseInt(tourStats?.tour_count || 0);
        const totalRevenue = parseFloat(bookingStats?.revenue || 0) + parseFloat(tourStats?.tour_revenue || 0);
        
        const lastVisit = [bookingStats?.last_visit, tourStats?.last_tour]
            .filter(Boolean)
            .sort()
            .reverse()[0] || null;

        // Auto-classify guest type
        let guestType = 'new';
        if (totalRevenue >= 50000) {
            guestType = 'vip';
        } else if (totalVisits >= 3) {
            guestType = 'regular';
        }

        const guest = await User.findByPk(guestId);
        await guest.update({
            total_visits: totalVisits,
            total_revenue: totalRevenue,
            last_visit_date: lastVisit,
            guest_type: guestType,
            loyalty_points: Math.floor(totalRevenue / 100)
        });

        res.json({ message: 'Guest metrics refreshed successfully', guest });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ===================================
// CRM DASHBOARD
// ===================================

// @desc    Get CRM dashboard
// @route   GET /api/admin/crm
// @access  Private/Admin
exports.getCRMDashboard = async (req, res) => {
    try {
        // Stats
        const stats = {
            total_guests: await User.count({ where: { role: 'user' } }),
            vip_count: await User.count({ where: { guest_type: 'vip' } }),
            regular_count: await User.count({ where: { guest_type: 'regular' } }),
            new_count: await User.count({ where: { guest_type: 'new' } }),
            marketing_subscribers: await User.count({ where: { marketing_consent: true } })
        };

        const revenueResult = await User.sum('total_revenue');
        stats.total_revenue = revenueResult || 0;

        // VIP guests
        const vipGuests = await User.findAll({
            where: { guest_type: 'vip' },
            attributes: { exclude: ['password'] },
            order: [['total_revenue', 'DESC']],
            limit: 10
        });

        // Regular guests
        const regularGuests = await User.findAll({
            where: { guest_type: 'regular' },
            attributes: { exclude: ['password'] },
            order: [['total_revenue', 'DESC']],
            limit: 10
        });

        // Inactive guests (90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const inactiveGuests = await User.findAll({
            where: {
                last_visit_date: {
                    [Op.not]: null,
                    [Op.lt]: ninetyDaysAgo
                },
                role: 'user'
            },
            attributes: { exclude: ['password'] },
            order: [['total_revenue', 'DESC']],
            limit: 10
        });

        // Birthday guests this month
        const currentMonth = new Date().getMonth() + 1;
        const birthdayGuests = await User.findAll({
            where: {
                birthday: {
                    [Op.not]: null
                },
                [Op.and]: [
                    literal(`MONTH(birthday) = ${currentMonth}`)
                ],
                role: 'user'
            },
            attributes: { exclude: ['password'] },
            order: [[literal('DAY(birthday)'), 'ASC']]
        });

        res.json({
            stats,
            vipGuests,
            regularGuests,
            inactiveGuests,
            birthdayGuests
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Export marketing list
// @route   GET /api/admin/crm/export-marketing
// @access  Private/Admin
exports.exportMarketingList = async (req, res) => {
    try {
        const subscribers = await User.findAll({
            where: {
                marketing_consent: true,
                role: 'user'
            },
            attributes: ['first_name', 'last_name', 'email', 'phone_number', 'guest_type', 'total_revenue', 'last_visit_date']
        });

        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ===================================
// ROOM MANAGEMENT
// ===================================

// @desc    Get all rooms
// @route   GET /api/admin/rooms
// @access  Private/Admin
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll({
            include: {
                model: RoomType,
                attributes: ['name', 'base_price']
            },
            order: [['room_number', 'ASC']]
        });
        console.log('getAllRooms - Found rooms:', rooms.length);
        res.json(rooms);
    } catch (error) {
        console.error('getAllRooms error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a new room
// @route   POST /api/admin/rooms
// @access  Private/Admin
exports.createRoom = async (req, res) => {
    try {
        const { room_type_id, room_number, status } = req.body;
        
        const room = await Room.create({
            room_type_id,
            room_number,
            status: status || 'available'
        });

        const roomWithType = await Room.findByPk(room.id, {
            include: { model: RoomType, attributes: ['name', 'base_price'] }
        });

        res.status(201).json(roomWithType);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a room
// @route   PUT /api/admin/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res) => {
    try {
        const { room_type_id, room_number, status } = req.body;
        const room = await Room.findByPk(req.params.id);

        if (room) {
            room.room_type_id = room_type_id || room.room_type_id;
            room.room_number = room_number || room.room_number;
            room.status = status || room.status;

            await room.save();
            
            const updatedRoom = await Room.findByPk(room.id, {
                include: { model: RoomType, attributes: ['name', 'base_price'] }
            });
            
            res.json(updatedRoom);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a room
// @route   DELETE /api/admin/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByPk(req.params.id);

        if (room) {
            await room.destroy();
            res.json({ message: 'Room removed' });
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ===================================
// BOOKING MANAGEMENT
// ===================================

// @desc    Get all room bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                {
                    model: Room,
                    include: { model: RoomType, attributes: ['name'] }
                },
                {
                    model: User,
                    as: 'Guest',
                    attributes: ['first_name', 'last_name', 'email']
                }
            ],
            order: [['check_in_date', 'DESC']]
        });
        console.log('getAllBookings - Found bookings:', bookings.length);
        res.json(bookings);
    } catch (error) {
        console.error('getAllBookings error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all tour bookings
// @route   GET /api/admin/tour-bookings
// @access  Private/Admin
exports.getAllTourBookings = async (req, res) => {
    try {
        const bookings = await TourBooking.findAll({
            include: [
                { model: Tour, attributes: ['name', 'price'] },
                {
                    model: User,
                    as: 'Guest',
                    attributes: ['first_name', 'last_name', 'email']
                }
            ],
            order: [['booking_date', 'DESC']]
        });
        console.log('getAllTourBookings - Found bookings:', bookings.length);
        res.json(bookings);
    } catch (error) {
        console.error('getAllTourBookings error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single tour booking by ID
// @route   GET /api/admin/tour-bookings/:id
// @access  Private/Admin
exports.getTourBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('getTourBookingById - Fetching booking with ID:', id);
        console.log('getTourBookingById - ID type:', typeof id);

        const booking = await TourBooking.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'Guest',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: Tour,
                    attributes: ['id', 'name', 'description', 'price']
                }
            ]
        });

        console.log('getTourBookingById - Found booking:', booking ? 'YES' : 'NO');
        if (booking) {
            console.log('getTourBookingById - Booking details:', JSON.stringify(booking, null, 2));
        }

        if (!booking) {
            console.log('getTourBookingById - Returning 404');
            return res.status(404).json({ message: 'Booking not found' });
        }

        console.log('getTourBookingById - Returning booking data');
        res.json(booking);
    } catch (error) {
        console.error('getTourBookingById error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Confirm tour booking (change status from pending to confirmed)
// @route   PATCH /api/admin/tour-bookings/:id/confirm
// @access  Private/Admin
exports.confirmTourBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await TourBooking.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'Guest',
                    attributes: ['first_name', 'last_name', 'email']
                },
                {
                    model: Tour,
                    attributes: ['name']
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Tour booking not found' });
        }

        if (booking.status === 'confirmed') {
            return res.status(400).json({ message: 'Tour booking is already confirmed' });
        }

        await booking.update({ status: 'confirmed' });

        res.json({
            message: 'Tour booking confirmed successfully',
            booking
        });
    } catch (error) {
        console.error('confirmTourBooking error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ===================================
// FRONT DESK - ROOM ASSIGNMENT
// ===================================

// @desc    Get unassigned bookings (bookings without room_id)
// @route   GET /api/admin/bookings/unassigned
// @access  Private/Admin
exports.getUnassignedBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: {
                room_id: null,
                status: 'confirmed'
            },
            include: [
                {
                    model: User,
                    as: 'Guest',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: RoomType,
                    attributes: ['id', 'name']
                }
            ],
            order: [['check_in_date', 'ASC']]
        });

        const formattedBookings = bookings.map(b => ({
            id: b.id,
            guest_name: `${b.Guest.first_name} ${b.Guest.last_name}`,
            guest_email: b.Guest.email,
            room_type_id: b.room_type_id,
            room_type_name: b.RoomType.name,
            check_in_date: b.check_in_date,
            check_out_date: b.check_out_date,
            check_in_time: b.check_in_time,
            check_out_time: b.check_out_time,
            status: b.status,
            total_price: b.total_price
        }));

        res.json(formattedBookings);
    } catch (error) {
        console.error('getUnassignedBookings error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get available rooms for a specific room type and date range
// @route   GET /api/admin/rooms/available
// @access  Private/Admin
exports.getAvailableRoomsForAssignment = async (req, res) => {
    try {
        const { room_type_id, check_in, check_out } = req.query;

        // Get all rooms of this type
        const rooms = await Room.findAll({
            where: {
                room_type_id: room_type_id,
                status: 'available'
            }
        });

        // Filter out rooms that have conflicting bookings
        const availableRooms = [];
        
        for (const room of rooms) {
            const conflictingBooking = await Booking.findOne({
                where: {
                    room_id: room.id,
                    status: { [Op.notIn]: ['cancelled'] },
                    [Op.or]: [
                        {
                            check_in_date: {
                                [Op.between]: [check_in, check_out]
                            }
                        },
                        {
                            check_out_date: {
                                [Op.between]: [check_in, check_out]
                            }
                        },
                        {
                            [Op.and]: [
                                { check_in_date: { [Op.lte]: check_in } },
                                { check_out_date: { [Op.gte]: check_out } }
                            ]
                        }
                    ]
                }
            });

            if (!conflictingBooking) {
                availableRooms.push(room);
            }
        }

        res.json(availableRooms);
    } catch (error) {
        console.error('getAvailableRoomsForAssignment error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Assign room to a booking
// @route   PUT /api/admin/bookings/:id/assign-room
// @access  Private/Admin
exports.assignRoomToBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { room_id } = req.body;

        const booking = await Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify the room exists and is available
        const room = await Room.findByPk(room_id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Update booking with room assignment
        booking.room_id = room_id;
        await booking.save();

        // Optionally update room status
        // room.status = 'occupied';
        // await room.save();

        res.json({ message: 'Room assigned successfully', booking });
    } catch (error) {
        console.error('assignRoomToBooking error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
