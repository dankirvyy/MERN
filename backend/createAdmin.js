// Script to create an admin user
// Run with: node createAdmin.js

require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./models/User');

const createAdminUser = async () => {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('Database connected');

        // Admin user details - CHANGE THESE!
        const adminData = {
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@example.com',  // CHANGE THIS
            password: 'admin123',         // CHANGE THIS
            role: 'admin',
            phone_number: '1234567890'
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            where: { email: adminData.email } 
        });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Updating role to admin...');
            
            // Just update the role if user exists
            await existingAdmin.update({ role: 'admin' });
            console.log('✓ User role updated to admin');
            console.log(`Email: ${adminData.email}`);
        } else {
            // Create new admin user
            const admin = await User.create(adminData);
            console.log('✓ Admin user created successfully!');
            console.log(`Email: ${admin.email}`);
            console.log(`Password: ${adminData.password}`);
            console.log(`ID: ${admin.id}`);
        }

        console.log('\nYou can now login with these credentials.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
