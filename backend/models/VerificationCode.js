const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VerificationCode = sequelize.define('VerificationCode', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('signup', 'password_reset'),
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'verification_codes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = VerificationCode;
