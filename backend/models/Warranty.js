const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Warranty = sequelize.define('Warranty', {
    warranty_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    warranty_serial_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    warranty_invoice_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    warranty_purchase_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    warranty_status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false
    },
    warranty_expiry_date: {
        type: DataTypes.VIRTUAL,
        get() {
            const rawValue = this.getDataValue('warranty_purchase_date');
            if (!rawValue) return null;

            const dateStr = rawValue instanceof Date
                ? rawValue.toISOString().split('T')[0]
                : String(rawValue).split(' ')[0];

            const [year, month, day] = dateStr.split('-');

            const expiryYear = parseInt(year) + 1;

            return `${expiryYear}-${month}-${day}`;
        }
    },
    is_expired: {
        type: DataTypes.VIRTUAL,
        get() {
            const rawValue = this.getDataValue('warranty_purchase_date');
            if (!rawValue) return true;

            const dateStr = rawValue instanceof Date
                ? rawValue.toISOString().split('T')[0]
                : String(rawValue).split(' ')[0];

            const [year, month, day] = dateStr.split('-');

            const expiry = new Date(parseInt(year) + 1, parseInt(month) - 1, parseInt(day));

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            expiry.setHours(0, 0, 0, 0);

            return today > expiry;
        }
    }
}, {
    tableName: 'warranties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Asociación
Warranty.associate = (models) => {
    Warranty.hasMany(models.Ticket, {
        foreignKey: 'ticket_serial_number',
        sourceKey: 'warranty_serial_number',
        as: 'history'
    });
};

module.exports = Warranty;