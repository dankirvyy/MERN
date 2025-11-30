require('dotenv').config();
const { sequelize } = require('./config/db');
const Room = require('./models/Room');
const RoomType = require('./models/RoomType');

async function addRoom() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Check if room type 7 exists
        const roomType = await RoomType.findByPk(7);
        if (!roomType) {
            console.log('❌ Room Type 7 does not exist');
            process.exit(1);
        }

        console.log(`Found Room Type: ${roomType.name}`);

        // Check if room 701 already exists
        const existingRoom = await Room.findOne({
            where: {
                room_type_id: 7,
                room_number: '701'
            }
        });

        if (existingRoom) {
            console.log('⚠️  Room 701 already exists. Updating status to "available"...');
            existingRoom.status = 'available';
            await existingRoom.save();
            console.log('✅ Room 701 updated to available');
        } else {
            // Create new room
            const newRoom = await Room.create({
                room_type_id: 7,
                room_number: '701',
                status: 'available'
            });
            console.log(`✅ Created Room ${newRoom.room_number} for ${roomType.name}`);
        }

        // Show all rooms for this type
        const allRooms = await Room.findAll({
            where: { room_type_id: 7 }
        });

        console.log(`\nTotal rooms for ${roomType.name}: ${allRooms.length}`);
        allRooms.forEach(room => {
            console.log(`  - Room ${room.room_number}: ${room.status}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addRoom();
