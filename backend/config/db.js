const { Sequelize } = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql', // Tell Sequelize we're using MySQL
    }
);

// Test the connection
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connected...');
    } catch (error) {
        console.error('MySQL Connection Error:', error);
    }
};

module.exports = { sequelize, connectDB };