require('dotenv').config();
const { sequelize } = require('./config/db');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

async function checkRoomStatus() {
    try {
        await sequelize.authenticate();
        
        // Find Room BS-101
        const room = await Room.findOne({
            where: { room_number: 'BS-101' }
        });

        if (!room) {
            console.log('❌ Room BS-101 not found');
            process.exit(1);
        }

        console.log(`\n📍 Room BS-101 (ID: ${room.id})`);
        console.log(`   Status: ${room.status}`);
        console.log(`   Room Type ID: ${room.room_type_id}`);

        // Find bookings for this room
        const bookings = await Booking.findAll({
            where: { room_id: room.id },
            order: [['check_in_date', 'DESC']],
            limit: 5
        });

        console.log(`\n📋 Bookings for Room BS-101:`);
        if (bookings.length === 0) {
            console.log('   No bookings found');
        } else {
            bookings.forEach(b => {
                console.log(`   Booking #${b.id}: ${b.check_in_date} to ${b.check_out_date}`);
                console.log(`      Status: ${b.status}, Payment: ${b.payment_status}`);
            });
        }

        // Update room status to 'occupied' if it's 'available'
        if (room.status === 'available') {
            console.log(`\n🔧 Updating Room BS-101 status from 'available' to 'occupied'...`);
            room.status = 'occupied';
            await room.save();
            console.log('✅ Room status updated to occupied');
        } else {
            console.log(`\n✅ Room is already occupied`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkRoomStatus();
