const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const RoomType = require('./RoomType'); // Import RoomType to create the link

const Room = sequelize.define('Room', {
    room_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    room_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'available',
    }
}, {
    tableName: 'rooms',
    timestamps: false,
});

// --- Associations ---
// A Room belongs to one RoomType
Room.belongsTo(RoomType, { foreignKey: 'room_type_id' });
// A RoomType can have many Rooms
RoomType.hasMany(Room, { foreignKey: 'room_type_id' });

module.exports = Room;