// ============================================
// MODELO: SALIDA
// Representa una solicitud de salida de equipo
// asociada a un ticket. Un técnico solicita
// llevar el equipo a una dirección externa
// (salida_destination) en una fecha y hora
// determinadas. La solicitud pasa por un flujo
// de aprobación: Pendiente → Aprobada/Rechazada.
// El campo approved_by registra qué usuario del
// panel autorizó o rechazó la salida, y
// rejection_reason se llena solo cuando el
// estado es Rechazada (2).
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Salida = sequelize.define('Salida', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    salida_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },

    // ============================================
    // CLAVES FORÁNEAS
    // ticket_id vincula la salida al ticket de
    // soporte que la originó. user_id identifica
    // al técnico que registró la solicitud.
    // ============================================
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },

    // ============================================
    // DATOS DE LA SALIDA
    // salida_destination es la dirección o lugar
    // al que se lleva el equipo. salida_date y
    // salida_time se almacenan por separado para
    // facilitar consultas y visualización.
    // ============================================
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

    // ============================================
    // ESTADO DEL FLUJO DE APROBACIÓN
    // 0 = Pendiente | 1 = Aprobada | 2 = Rechazada
    // Inicia en 0; el supervisor lo cambia a 1 o 2.
    // rejection_reason se registra solo en estado 2.
    // approved_by es null mientras está pendiente;
    // se llena con el user_id del supervisor que
    // tomó la decisión (aprobó o rechazó).
    // ============================================
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

// ============================================
// ASOCIACIONES
// Dos relaciones hacia User con alias distintos:
// 'user' es quien creó la solicitud y
// 'approvedBy' es quien la aprobó o rechazó.
// approved_by puede ser null (salida pendiente).
// ============================================
Salida.associate = (models) => {
    Salida.belongsTo(models.Ticket, {
        foreignKey: 'ticket_id',
        as: 'ticket',
    });

    Salida.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
    });

    Salida.belongsTo(models.User, {
        foreignKey: 'approved_by',
        as: 'approvedBy',
    });
};

module.exports = Salida;