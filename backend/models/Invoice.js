const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Booking = require('./Booking');
const TourBooking = require('./TourBooking');

const Invoice = sequelize.define('Invoice', {
    booking_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'bookings',
            key: 'id'
        }
    },
    tour_booking_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'tour_bookings',
            key: 'id'
        }
    },
    issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
        defaultValue: 'unpaid',
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'invoices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

// Associations
Invoice.belongsTo(Booking, { foreignKey: 'booking_id' });
Invoice.belongsTo(TourBooking, { foreignKey: 'tour_booking_id' });

module.exports = Invoice;
