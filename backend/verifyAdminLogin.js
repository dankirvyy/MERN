require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function verifyAdminLogin() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.\n');

        const email = 'admin@gmail.com';
        const password = 'admin#11';

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log('=== User Details ===');
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.first_name} ${user.last_name}`);
        console.log(`Role: ${user.role}`);
        console.log(`Has Password: ${user.password ? 'Yes' : 'No'}`);
        console.log(`Google ID: ${user.google_id || 'None'}`);

        if (user.password) {
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`\n=== Password Test ===`);
            console.log(`Password "${password}" matches: ${isMatch ? '✅ YES' : '❌ NO'}`);
        } else {
            console.log('\n⚠️ This account has no password (Google OAuth only)');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyAdminLogin();
