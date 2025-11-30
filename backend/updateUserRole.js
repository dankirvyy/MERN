require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./models/User');

async function updateUserRole() {
    try {
        const email = process.argv[2];
        const role = process.argv[3];

        if (!email || !role) {
            console.log('Usage: node updateUserRole.js <email> <role>');
            console.log('Roles: user, admin, front_desk');
            process.exit(1);
        }

        if (!['user', 'admin', 'front_desk'].includes(role)) {
            console.log('Invalid role. Must be: user, admin, or front_desk');
            process.exit(1);
        }

        await sequelize.authenticate();
        console.log('Database connected successfully.');

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = role;
        await user.save();

        console.log(`✅ Successfully updated user role:`);
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.first_name} ${user.last_name}`);
        console.log(`New Role: ${user.role}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateUserRole();
