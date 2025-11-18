const { Op, fn, col } = require('sequelize');
const Booking = require('../models/Booking');
const TourBooking = require('../models/TourBooking');
const Room = require('../models/Room');
const User = require('../models/User');

/**
 * Auto-cleanup expired bookings
 * Marks bookings as completed and frees up rooms when check-out date has passed
 */
const autoCleanupExpiredBookings = async () => {
    try {
        const now = new Date();

        // Update expired room bookings to completed
        const expiredBookings = await Booking.findAll({
            where: {
                status: 'confirmed',
                [Op.and]: [
                    {
                        check_out_date: {
                            [Op.lt]: now.toISOString().split('T')[0]
                        }
                    }
                ]
            }
        });

        // Get affected guest IDs
        const affectedGuestIds = [...new Set(expiredBookings.map(b => b.guest_id).filter(Boolean))];

        // Update bookings to completed
        await Booking.update(
            { status: 'completed' },
            {
                where: {
                    status: 'confirmed',
                    [Op.and]: [
                        {
                            check_out_date: {
                                [Op.lt]: now.toISOString().split('T')[0]
                            }
                        }
                    ]
                }
            }
        );

        // Free up rooms that no longer have active bookings
        const occupiedRooms = await Room.findAll({
            where: { status: 'occupied' }
        });

        for (const room of occupiedRooms) {
            const activeBooking = await Booking.findOne({
                where: {
                    room_id: room.id,
                    status: 'confirmed'
                }
            });

            if (!activeBooking) {
                await room.update({ status: 'available' });
            }
        }

        // Refresh metrics for affected guests
        for (const guestId of affectedGuestIds) {
            await refreshGuestMetrics(guestId);
        }

        console.log(`Auto-cleanup: ${expiredBookings.length} bookings completed`);
    } catch (error) {
        console.error('Auto-cleanup error:', error);
    }
};

/**
 * Refresh guest metrics (total visits, revenue, last visit)
 */
const refreshGuestMetrics = async (guestId) => {
    try {
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
        if (guest) {
            await guest.update({
                total_visits: totalVisits,
                total_revenue: totalRevenue,
                last_visit_date: lastVisit,
                guest_type: guestType,
                loyalty_points: Math.floor(totalRevenue / 100)
            });
        }
    } catch (error) {
        console.error(`Error refreshing metrics for guest ${guestId}:`, error);
    }
};

module.exports = {
    autoCleanupExpiredBookings,
    refreshGuestMetrics
};
