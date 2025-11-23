// Script to create a front desk user
// Run with: node createFrontDesk.js

require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./models/User');

const createFrontDeskUser = async () => {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('Database connected');

        // Front Desk user details - CHANGE THESE!
        const frontDeskData = {
            first_name: 'Front',
            last_name: 'Desk',
            email: 'frontdesk@example.com',  // CHANGE THIS
            password: 'frontdesk123',         // CHANGE THIS
            role: 'front_desk',
            phone_number: '1234567890'
        };

        // Check if front desk user already exists
        const existingUser = await User.findOne({ 
            where: { email: frontDeskData.email } 
        });

        if (existingUser) {
            console.log('Front Desk user already exists!');
            console.log('Updating role to front_desk...');
            
            // Just update the role if user exists
            await existingUser.update({ role: 'front_desk' });
            console.log('✓ User role updated to front_desk');
            console.log(`Email: ${frontDeskData.email}`);
        } else {
            // Create new front desk user
            const frontDesk = await User.create(frontDeskData);
            console.log('✓ Front Desk user created successfully!');
            console.log(`Email: ${frontDesk.email}`);
            console.log(`Password: ${frontDeskData.password}`);
            console.log(`ID: ${frontDesk.id}`);
        }

        console.log('\nYou can now login with these credentials.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating front desk user:', error);
        process.exit(1);
    }
};

createFrontDeskUser();
