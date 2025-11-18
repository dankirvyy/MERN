const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Invoice = require('./Invoice');

const InvoiceItem = sequelize.define('InvoiceItem', {
    invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'invoices',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    tableName: 'invoice_items',
    timestamps: false,
});

// Associations
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id' });
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoice_id' });

module.exports = InvoiceItem;
