const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Resource = sequelize.define('Resource', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('Guide', 'Vehicle', 'Boat', 'Equipment'),
        allowNull: false,
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'resources',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = Resource;
