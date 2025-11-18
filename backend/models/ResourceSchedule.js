const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Resource = require('./Resource');
const TourBooking = require('./TourBooking');

const ResourceSchedule = sequelize.define('ResourceSchedule', {
    resource_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'resources',
            key: 'id'
        }
    },
    tour_booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tour_bookings',
            key: 'id'
        }
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false,
    }
}, {
    tableName: 'resource_schedules',
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

// Associations
ResourceSchedule.belongsTo(Resource, { foreignKey: 'resource_id' });
ResourceSchedule.belongsTo(TourBooking, { foreignKey: 'tour_booking_id' });

module.exports = ResourceSchedule;
