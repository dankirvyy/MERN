const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Room = require('./Room');
const RoomType = require('./RoomType');

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
// We also add the reverse association
Room.hasMany(Booking, { foreignKey: 'room_id' });

module.exports = Booking;