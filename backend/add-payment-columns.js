// Run this file to add payment_method columns to the database
const { sequelize } = require('./config/db');

async function addPaymentMethodColumns() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('✓ Connected to database');

        console.log('\nAdding payment_method column to bookings table...');
        await sequelize.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NULL
        `);
        console.log('✓ Added payment_method to bookings');

        console.log('\nAdding payment_method column to tour_bookings table...');
        await sequelize.query(`
            ALTER TABLE tour_bookings 
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NULL
        `);
        console.log('✓ Added payment_method to tour_bookings');

        console.log('\n✓ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nIf column already exists, you can ignore this error.');
        process.exit(1);
    }
}

addPaymentMethodColumns();
