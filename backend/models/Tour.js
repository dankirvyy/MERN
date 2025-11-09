const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tour = sequelize.define('Tour', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    duration: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
    },
    image_filename: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    
    // --- NEW FIELDS ---
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
    },
    // --- END NEW FIELDS ---

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'tours',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = Tour;