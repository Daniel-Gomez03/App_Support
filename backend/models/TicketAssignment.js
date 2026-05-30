// ============================================
// MODELO: TICKETASSIGNMENT
// Tabla intermedia de la relación N:M entre
// Ticket y User. Registra qué técnicos están
// asignados a cada ticket. La clave primaria
// compuesta (ticket_id + user_id) garantiza
// que un técnico no pueda ser asignado dos
// veces al mismo ticket. No tiene campos extra
// porque la asignación en sí es el dato
// relevante; las notas de asignación se
// almacenan en Ticket.assignment_remarks.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketAssignment = sequelize.define('TicketAssignment', {
    // ============================================
    // CLAVE PRIMARIA COMPUESTA
    // Ambos campos forman juntos la PK para
    // evitar asignaciones duplicadas del mismo
    // técnico al mismo ticket.
    // ============================================
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        allowNull: false,
    },
}, {
    tableName: 'ticket_assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = TicketAssignment;