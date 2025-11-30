const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Room = require('./Room');
const RoomType = require('./RoomType');
const User = require('./User');

// Forward declaration to avoid circular dependency
let Invoice;

const Booking = sequelize.define('Booking', {
    guest_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    room_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    room_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Now nullable - will be assigned by front desk
    },
    num_guests: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    check_in_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    check_out_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    },
    check_in_time: {
        type: DataTypes.TIME,
        defaultValue: '14:00:00',
    },
    check_out_time: {
        type: DataTypes.TIME,
        defaultValue: '12:00:00',
    },
    payment_status: {
        type: DataTypes.ENUM('unpaid', 'partial', 'paid', 'refunded'),
        defaultValue: 'unpaid',
    },
    amount_paid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    balance_due: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    refunded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    refund_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

// --- Associations ---
// A Booking belongs to one Room (nullable now)
Booking.belongsTo(Room, { foreignKey: 'room_id' });
// A Booking belongs to one RoomType
Booking.belongsTo(RoomType, { foreignKey: 'room_type_id' });
// A Booking belongs to one User (Guest)
Booking.belongsTo(User, { as: 'Guest', foreignKey: 'guest_id' });

// Set up Invoice association after model is exported
// This avoids circular dependency issues
setTimeout(() => {
    Invoice = require('./Invoice');
    Booking.hasOne(Invoice, { foreignKey: 'booking_id' });
}, 0);

module.exports = Booking;