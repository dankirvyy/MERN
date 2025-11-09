const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    // Model attributes are defined here
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user',
    },
    avatar_filename: {
        type: DataTypes.STRING,
        allowNull: true,
    }
    // <<< CONFLICTING 'created_at' and 'updated_at' BLOCKS REMOVED FROM HERE >>>
}, {
    // --- Model options ---
    tableName: 'guests',        // Use the 'guests' table
    timestamps: true,           // Enable timestamps
    createdAt: 'created_at',    // Map model's createdAt to 'created_at' column
    updatedAt: false,         // Tell Sequelize there is NO 'updated_at' column

    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    },
});

User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;