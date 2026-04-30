const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Salida = sequelize.define('Salida', {
    salida_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    salida_destination: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    salida_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    salida_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    // 0 = Pendiente | 1 = Aprobada | 2 = Rechazada
    salida_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    approved_by: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: true,
        defaultValue: null,
    },
}, {
    tableName: 'salidas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Salida;