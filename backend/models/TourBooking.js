const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Tour = require('./Tour'); // Import Tour

const TourBooking = sequelize.define('TourBooking', {
    guest_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    booking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    number_of_pax: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    }
}, {
    tableName: 'tour_bookings',
    timestamps: false,
});

// --- Associations ---
// A TourBooking belongs to one Tour
TourBooking.belongsTo(Tour, { foreignKey: 'tour_id' });
// A Tour can have many TourBookings
Tour.hasMany(TourBooking, { foreignKey: 'tour_id' });

module.exports = TourBooking;