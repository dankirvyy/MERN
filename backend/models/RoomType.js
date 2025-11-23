const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RoomType = sequelize.define('RoomType', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    image_filename: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
    },
}, {
    tableName: 'room_types',
    timestamps: false, // This table doesn't have created_at/updated_at
});

module.exports = RoomType;