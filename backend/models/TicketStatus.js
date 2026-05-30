// ============================================
// MODELO: TICKETSTATUS
// Catálogo de estados del flujo de trabajo de
// un ticket (ej. Abierto, En progreso, Cerrado,
// Cancelado, etc). Cada estado tiene un nombre único
// que el panel y la app muestran al usuario.
// Los estados inactivos (ticket_status=0) se
// conservan por historial en tickets existentes
// pero no aparecen como opción al actualizar
// el estado de un ticket.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketStatus = sequelize.define('TicketStatus', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    ticket_status_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },

    // ============================================
    // NOMBRE DEL ESTADO
    // UNIQUE para evitar estados duplicados en el
    // catálogo. Es el texto que se muestra en la
    // UI del panel y de la app móvil.
    // ============================================
    ticket_status_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },

    // ============================================
    // ESTADO DEL REGISTRO (activo / inactivo)
    // ============================================
    ticket_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false,
    },
}, {
    tableName: 'tickets_statuses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// ============================================
// ASOCIACIONES
// ============================================
TicketStatus.associate = (models) => {
    TicketStatus.hasMany(models.Ticket, {
        foreignKey: 'ticket_status_id',
        as: 'tickets',
    });
};

module.exports = TicketStatus;