const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Room = require('./Room');
const RoomType = require('./RoomType');
const User = require('./User');

const Booking = sequelize.define('Booking', {
    guest_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
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
// A Booking belongs to one Room
Booking.belongsTo(Room, { foreignKey: 'room_id' });
// A Booking belongs to one User (Guest)
Booking.belongsTo(User, { as: 'Guest', foreignKey: 'guest_id' });

module.exports = Booking;