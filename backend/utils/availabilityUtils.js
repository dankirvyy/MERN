const { Op } = require('sequelize');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');

/**
 * Check if a specific room is available for given dates
 * @param {number} roomId - The room ID to check
 * @param {string} checkInDate - Check-in date (YYYY-MM-DD)
 * @param {string} checkOutDate - Check-out date (YYYY-MM-DD)
 * @param {number} excludeBookingId - Optional booking ID to exclude (for updates)
 * @returns {Promise<boolean>} - True if available, false if conflicting
 */
async function isRoomAvailable(roomId, checkInDate, checkOutDate, excludeBookingId = null) {
    try {
        console.log(`\n🔍 Checking availability for Room ${roomId}:`);
        console.log(`   New booking: ${checkInDate} to ${checkOutDate}`);
        
        const whereClause = {
            room_id: roomId,
            status: {
                [Op.in]: ['pending', 'confirmed', 'checked_in']
            },
            [Op.or]: [
                // Conflict if: existing check-in < new check-out AND existing check-out > new check-in
                // This allows same-day checkout/checkin (checkout on Dec 3, checkin on Dec 3)
                {
                    [Op.and]: [
                        {
                            check_in_date: {
                                [Op.lt]: checkOutDate
                            }
                        },
                        {
                            check_out_date: {
                                [Op.gt]: checkInDate
                            }
                        }
                    ]
                }
            ]
        };

        // Exclude specific booking (useful for updates)
        if (excludeBookingId) {
            whereClause.id = { [Op.ne]: excludeBookingId };
        }

        const conflictingBooking = await Booking.findOne({
            where: whereClause
        });

        if (conflictingBooking) {
            console.log(`   ❌ CONFLICT found - Existing booking:`, {
                id: conflictingBooking.id,
                check_in: conflictingBooking.check_in_date,
                check_out: conflictingBooking.check_out_date,
                status: conflictingBooking.status
            });
        } else {
            console.log(`   ✅ AVAILABLE - No conflicts`);
        }

        return !conflictingBooking; // Returns true if no conflict found
    } catch (error) {
        console.error('Error checking room availability:', error);
        throw error;
    }
}

/**
 * Get all available rooms of a specific type for given dates
 * @param {number} roomTypeId - The room type ID
 * @param {string} checkInDate - Check-in date (YYYY-MM-DD)
 * @param {string} checkOutDate - Check-out date (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of available room objects
 */
async function getAvailableRoomsByType(roomTypeId, checkInDate, checkOutDate) {
    try {
        console.log(`\n📋 Checking availability for Room Type ${roomTypeId} from ${checkInDate} to ${checkOutDate}`);
        
        // Get all rooms of this type (including occupied ones - we check date conflicts separately)
        const rooms = await Room.findAll({
            where: {
                room_type_id: roomTypeId
                // Don't filter by status - allow booking occupied rooms for non-conflicting dates
            },
            include: {
                model: RoomType,
                as: 'RoomType',
                attributes: ['name', 'base_price', 'capacity']
            }
        });

        console.log(`   Found ${rooms.length} total room(s) of this type`);

        // Check each room for availability
        const availableRooms = [];
        for (const room of rooms) {
            const isAvailable = await isRoomAvailable(room.id, checkInDate, checkOutDate);
            if (isAvailable) {
                availableRooms.push(room);
            }
        }

        console.log(`   ✅ ${availableRooms.length} room(s) available\n`);

        return availableRooms;
    } catch (error) {
        console.error('Error getting available rooms by type:', error);
        throw error;
    }
}

/**
 * Get count of available rooms for each room type for given dates
 * @param {string} checkInDate - Check-in date (YYYY-MM-DD)
 * @param {string} checkOutDate - Check-out date (YYYY-MM-DD)
 * @returns {Promise<Object>} - Object with room type IDs as keys and available counts as values
 */
async function getAvailabilityByRoomType(checkInDate, checkOutDate) {
    try {
        const roomTypes = await RoomType.findAll({
            attributes: ['id', 'name', 'base_price', 'capacity', 'description', 'image_filename']
        });

        const availability = {};

        for (const roomType of roomTypes) {
            const availableRooms = await getAvailableRoomsByType(roomType.id, checkInDate, checkOutDate);
            availability[roomType.id] = {
                roomType: {
                    id: roomType.id,
                    name: roomType.name,
                    base_price: roomType.base_price,
                    capacity: roomType.capacity,
                    description: roomType.description,
                    image_filename: roomType.image_filename
                },
                availableCount: availableRooms.length,
                availableRooms: availableRooms.map(r => ({
                    id: r.id,
                    room_number: r.room_number
                }))
            };
        }

        return availability;
    } catch (error) {
        console.error('Error getting availability by room type:', error);
        throw error;
    }
}

/**
 * Get bookings that conflict with given date range for a specific room type
 * @param {number} roomTypeId - The room type ID
 * @param {string} checkInDate - Check-in date (YYYY-MM-DD)
 * @param {string} checkOutDate - Check-out date (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of conflicting bookings
 */
async function getConflictingBookings(roomTypeId, checkInDate, checkOutDate) {
    try {
        const conflictingBookings = await Booking.findAll({
            where: {
                room_type_id: roomTypeId,
                status: {
                    [Op.in]: ['pending', 'confirmed', 'checked_in']
                },
                [Op.or]: [
                    {
                        check_in_date: {
                            [Op.lte]: checkInDate
                        },
                        check_out_date: {
                            [Op.gt]: checkInDate
                        }
                    },
                    {
                        check_in_date: {
                            [Op.lt]: checkOutDate
                        },
                        check_out_date: {
                            [Op.gte]: checkOutDate
                        }
                    },
                    {
                        check_in_date: {
                            [Op.gte]: checkInDate
                        },
                        check_out_date: {
                            [Op.lte]: checkOutDate
                        }
                    }
                ]
            },
            include: [
                {
                    model: Room,
                    attributes: ['id', 'room_number']
                }
            ]
        });

        return conflictingBookings;
    } catch (error) {
        console.error('Error getting conflicting bookings:', error);
        throw error;
    }
}

module.exports = {
    isRoomAvailable,
    getAvailableRoomsByType,
    getAvailabilityByRoomType,
    getConflictingBookings
};
