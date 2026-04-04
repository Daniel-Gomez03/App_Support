const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Warranty = sequelize.define('Warranty', {
    warranty_id: {
        type: DataTypes.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    warranty_serial_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false

    },
    warranty_purchase_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    warranty_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
    }
}, {
    tableName: 'warranties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

//Asociacion
Warranty.associate = (models) => {
    Warranty.hasMany(models.Ticket, {
        foreignKey: 'ticket_serial_number',
        sourceKey: 'warranty_serial_number',
        as: 'history' 
    });
};

module.exports = Warranty;