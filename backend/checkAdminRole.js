require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./models/User');

async function checkAndUpdateAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Find all users
        const users = await User.findAll({
            attributes: ['id', 'email', 'first_name', 'last_name', 'role']
        });

        console.log('\n=== Current Users ===');
        users.forEach(user => {
            console.log(`ID: ${user.id} | Email: ${user.email} | Name: ${user.first_name} ${user.last_name} | Role: ${user.role}`);
        });

        // Prompt to make a user admin
        console.log('\n=== To make a user admin ===');
        console.log('Run this command in your terminal:');
        console.log('node updateUserRole.js <email> admin');
        console.log('\nExample: node updateUserRole.js user@example.com admin');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAndUpdateAdmin();
