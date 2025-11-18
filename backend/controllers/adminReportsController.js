const { Op, fn, col, literal } = require('sequelize');
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
// REPORTS & ANALYTICS
// ===================================

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const startDate = start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = end_date || new Date();

        // Room booking revenue
        const roomRevenue = await Booking.sum('total_price', {
            where: {
                status: { [Op.in]: ['confirmed', 'completed'] },
                check_in_date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        }) || 0;

        // Tour booking revenue
        const tourRevenue = await TourBooking.sum('total_price', {
            where: {
                status: { [Op.in]: ['confirmed', 'completed'] },
                booking_date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        }) || 0;

        // Booking statistics
        const bookingStats = await Booking.findOne({
            attributes: [
                [fn('COUNT', col('id')), 'total_bookings'],
                [fn('SUM', literal(`CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END`)), 'confirmed'],
                [fn('SUM', literal(`CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END`)), 'cancelled'],
                [fn('SUM', literal(`CASE WHEN status = 'completed' THEN 1 ELSE 0 END`)), 'completed']
            ],
            where: {
                check_in_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            raw: true
        });

        // Most popular room types
        const popularRooms = await Booking.findAll({
            attributes: [
                [fn('COUNT', col('Booking.id')), 'booking_count'],
                [fn('SUM', col('Booking.total_price')), 'revenue']
            ],
            include: [
                {
                    model: Room,
                    include: [{ model: RoomType, attributes: ['name'] }]
                }
            ],
            where: {
                status: { [Op.in]: ['confirmed', 'completed'] },
                check_in_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: ['Room->RoomType.id'],
            order: [[fn('COUNT', col('Booking.id')), 'DESC']],
            limit: 5,
            raw: false
        });

        // Most popular tours
        const popularTours = await TourBooking.findAll({
            attributes: [
                [fn('COUNT', col('TourBooking.id')), 'booking_count'],
                [fn('SUM', col('TourBooking.total_price')), 'revenue']
            ],
            include: [{ model: Tour, attributes: ['name'] }],
            where: {
                status: { [Op.in]: ['confirmed', 'completed'] },
                booking_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: ['Tour.id'],
            order: [[fn('COUNT', col('TourBooking.id')), 'DESC']],
            limit: 5,
            raw: false
        });

        res.json({
            start_date: startDate,
            end_date: endDate,
            room_revenue: parseFloat(roomRevenue),
            tour_revenue: parseFloat(tourRevenue),
            total_revenue: parseFloat(roomRevenue) + parseFloat(tourRevenue),
            booking_stats: bookingStats,
            popular_rooms: popularRooms,
            popular_tours: popularTours
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Export bookings to CSV data
// @route   GET /api/admin/reports/export-bookings
// @access  Private/Admin
exports.exportBookings = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        let where = {};
        if (start_date && end_date) {
            where.check_in_date = {
                [Op.between]: [start_date, end_date]
            };
        }

        const bookings = await Booking.findAll({
            where,
            include: [
                {
                    model: Room,
                    include: [{ model: RoomType }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Get guest info for each booking
        const bookingsWithGuests = await Promise.all(
            bookings.map(async (booking) => {
                const guest = await User.findByPk(booking.guest_id, {
                    attributes: ['first_name', 'last_name', 'email']
                });
                return {
                    id: booking.id,
                    guest_name: guest ? `${guest.first_name} ${guest.last_name}` : 'N/A',
                    email: guest ? guest.email : 'N/A',
                    room_type: booking.Room?.RoomType?.name || 'N/A',
                    room_number: booking.Room?.room_number || 'N/A',
                    check_in_date: booking.check_in_date,
                    check_out_date: booking.check_out_date,
                    total_price: booking.total_price,
                    status: booking.status,
                    created_at: booking.created_at
                };
            })
        );

        res.json(bookingsWithGuests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ===================================
// BOOKING STATUS UPDATES
// ===================================

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await booking.update({ status });

        // If cancelling, free up the room
        if (status === 'cancelled') {
            const room = await Room.findByPk(booking.room_id);
            if (room) {
                await room.update({ status: 'available' });
            }
        }

        // If completing, refresh guest metrics
        if (status === 'completed' && booking.guest_id) {
            // We'll call the refresh metrics logic here
            const adminController = require('./adminController');
            req.params.id = booking.guest_id;
            await adminController.refreshGuestMetrics(req, { json: () => {} });
        }

        res.json({ message: `Booking status updated to ${status}`, booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update tour booking status
// @route   PUT /api/admin/tour-bookings/:id/status
// @access  Private/Admin
exports.updateTourBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const tourBooking = await TourBooking.findByPk(req.params.id);
        if (!tourBooking) {
            return res.status(404).json({ message: 'Tour booking not found' });
        }

        await tourBooking.update({ status });

        // If completing, refresh guest metrics
        if (status === 'completed' && tourBooking.guest_id) {
            const adminController = require('./adminController');
            req.params.id = tourBooking.guest_id;
            await adminController.refreshGuestMetrics(req, { json: () => {} });
        }

        res.json({ message: `Tour booking status updated to ${status}`, tourBooking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ===================================
// RESOURCE MANAGEMENT
// ===================================

// @desc    Get all resources
// @route   GET /api/admin/resources
// @access  Private/Admin
exports.getResources = async (req, res) => {
    try {
        const resources = await Resource.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create resource
// @route   POST /api/admin/resources
// @access  Private/Admin
exports.createResource = async (req, res) => {
    try {
        const { name, type, capacity, is_available } = req.body;
        
        const resource = await Resource.create({
            name,
            type,
            capacity,
            is_available: is_available !== undefined ? is_available : true
        });

        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update resource
// @route   PUT /api/admin/resources/:id
// @access  Private/Admin
exports.updateResource = async (req, res) => {
    try {
        const { name, type, capacity, is_available } = req.body;
        
        const resource = await Resource.findByPk(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        await resource.update({ name, type, capacity, is_available });
        res.json(resource);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete resource
// @route   DELETE /api/admin/resources/:id
// @access  Private/Admin
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        await resource.destroy();
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get resource schedules for a tour booking
// @route   GET /api/admin/tour-bookings/:id/resources
// @access  Private/Admin
exports.getTourBookingResources = async (req, res) => {
    try {
        console.log('getTourBookingResources - ID:', req.params.id);
        
        const schedules = await ResourceSchedule.findAll({
            where: { tour_booking_id: req.params.id },
            include: [{ model: Resource }],
            raw: false
        });

        console.log('Found schedules:', schedules.length);
        res.json(schedules);
    } catch (error) {
        console.error('getTourBookingResources error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Assign resource to tour booking
// @route   POST /api/admin/tour-bookings/:id/resources
// @access  Private/Admin
exports.assignResource = async (req, res) => {
    try {
        const { resource_id, start_time, end_time } = req.body;
        const tour_booking_id = req.params.id;

        // Check for conflicts
        const tourBooking = await TourBooking.findByPk(tour_booking_id);
        if (!tourBooking) {
            return res.status(404).json({ message: 'Tour booking not found' });
        }

        const conflicts = await ResourceSchedule.findAll({
            where: {
                resource_id,
                [Op.or]: [
                    {
                        start_time: { [Op.lte]: start_time },
                        end_time: { [Op.gte]: start_time }
                    },
                    {
                        start_time: { [Op.lte]: end_time },
                        end_time: { [Op.gte]: end_time }
                    },
                    {
                        start_time: { [Op.gte]: start_time },
                        end_time: { [Op.lte]: end_time }
                    }
                ]
            },
            include: [
                {
                    model: TourBooking,
                    where: {
                        booking_date: tourBooking.booking_date,
                        status: { [Op.in]: ['confirmed', 'pending'] }
                    }
                }
            ]
        });

        if (conflicts.length > 0) {
            return res.status(400).json({ 
                message: 'Resource has conflicts for this time slot',
                conflicts 
            });
        }

        const schedule = await ResourceSchedule.create({
            resource_id,
            tour_booking_id,
            start_time,
            end_time
        });

        res.status(201).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Unassign resource from tour booking
// @route   DELETE /api/admin/resource-schedules/:id
// @access  Private/Admin
exports.unassignResource = async (req, res) => {
    try {
        const schedule = await ResourceSchedule.findByPk(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        await schedule.destroy();
        res.json({ message: 'Resource unassigned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get resource calendar data
// @route   GET /api/admin/resources/calendar
// @access  Private/Admin
exports.getResourceCalendar = async (req, res) => {
    try {
        const { type, month, year } = req.query;
        const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();

        // Get statistics
        const totalResources = await Resource.count({ where: type ? { type } : {} });
        const availableResources = await Resource.count({ 
            where: { 
                is_available: true,
                ...(type && { type })
            } 
        });

        // Get scheduled resources for the month
        const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
        const lastDay = new Date(selectedYear, selectedMonth, 0);

        const scheduledCount = await ResourceSchedule.count({
            distinct: true,
            col: 'resource_id',
            include: [{
                model: TourBooking,
                where: {
                    booking_date: {
                        [Op.between]: [firstDay, lastDay]
                    },
                    status: { [Op.in]: ['confirmed', 'pending'] }
                },
                required: true
            }]
        });

        // Calculate utilization
        const totalSchedules = await ResourceSchedule.count({
            include: [{
                model: TourBooking,
                where: {
                    booking_date: {
                        [Op.between]: [firstDay, lastDay]
                    },
                    status: { [Op.in]: ['confirmed', 'pending'] }
                },
                required: true
            }]
        });

        const utilization = totalResources > 0 ? (totalSchedules / (totalResources * 30)) * 100 : 0;

        // Generate calendar days
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay();
        
        const calendarDays = [];
        const today = new Date();
        
        // Previous month days
        const prevMonthDays = new Date(selectedYear, selectedMonth - 1, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            calendarDays.push({
                day: prevMonthDays - i,
                is_other_month: true,
                is_today: false,
                schedules: []
            });
        }

        // Current month days with schedules
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(selectedYear, selectedMonth - 1, day);
            const isToday = currentDate.toDateString() === today.toDateString();

            // Get schedules for this day
            const schedules = await ResourceSchedule.findAll({
                include: [
                    { 
                        model: Resource,
                        where: type ? { type } : {},
                        required: true
                    },
                    {
                        model: TourBooking,
                        where: {
                            booking_date: currentDate.toISOString().split('T')[0],
                            status: { [Op.in]: ['confirmed', 'pending'] }
                        },
                        required: true,
                        include: [
                            { model: Tour, attributes: ['name'] },
                            { 
                                model: User, 
                                as: 'Guest',
                                attributes: ['first_name', 'last_name']
                            }
                        ]
                    }
                ]
            });

            const formattedSchedules = schedules.map(s => ({
                resource_name: s.Resource?.name || 'Unknown',
                resource_type: s.Resource?.type || 'other',
                tour_name: s.TourBooking?.Tour?.name || 'Unknown',
                guest_name: `${s.TourBooking?.Guest?.first_name || ''} ${s.TourBooking?.Guest?.last_name || ''}`.trim() || 'Unknown',
                booking_date: s.TourBooking?.booking_date,
                start_time: s.start_time,
                end_time: s.end_time,
                status: s.TourBooking?.status || 'pending'
            }));

            calendarDays.push({
                day,
                is_other_month: false,
                is_today: isToday,
                schedules: formattedSchedules
            });
        }

        // Next month days
        const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            calendarDays.push({
                day,
                is_other_month: true,
                is_today: false,
                schedules: []
            });
        }

        // Get all resources with their next booking and utilization
        const resourcesData = await Resource.findAll({
            where: type ? { type } : {},
            order: [['name', 'ASC']]
        });

        const resourcesWithData = await Promise.all(resourcesData.map(async (resource) => {
            // Get next booking
            const nextSchedule = await ResourceSchedule.findOne({
                where: { resource_id: resource.id },
                include: [{
                    model: TourBooking,
                    where: {
                        booking_date: { [Op.gte]: new Date() },
                        status: { [Op.in]: ['confirmed', 'pending'] }
                    },
                    required: true,
                    include: [{ model: Tour, attributes: ['name'] }]
                }],
                order: [[TourBooking, 'booking_date', 'ASC']]
            });

            const nextBooking = nextSchedule 
                ? `${new Date(nextSchedule.TourBooking.booking_date).toLocaleDateString()} - ${nextSchedule.TourBooking.Tour.name}`
                : null;

            // Calculate utilization
            const resourceSchedules = await ResourceSchedule.count({
                where: { resource_id: resource.id },
                include: [{
                    model: TourBooking,
                    where: {
                        booking_date: {
                            [Op.between]: [firstDay, lastDay]
                        },
                        status: { [Op.in]: ['confirmed', 'pending'] }
                    },
                    required: true
                }]
            });

            const resourceUtilization = (resourceSchedules / 30) * 100;

            return {
                id: resource.id,
                name: resource.name,
                type: resource.type,
                capacity: resource.capacity,
                is_available: resource.is_available,
                next_booking: nextBooking,
                utilization: resourceUtilization
            };
        }));

        res.json({
            stats: {
                total: totalResources,
                available: availableResources,
                scheduled_month: scheduledCount,
                utilization: utilization
            },
            calendar_days: calendarDays,
            resources: resourcesWithData
        });
    } catch (error) {
        console.error('getResourceCalendar error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = exports;
