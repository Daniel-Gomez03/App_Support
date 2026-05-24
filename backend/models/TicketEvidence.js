// ============================================
// MODELO: TICKETEVIDENCE
// Almacena los archivos de evidencia adjuntos
// a un ticket (fotos del equipo, capturas de
// error, documentos de soporte). Se suben al
// momento de crear o actualizar el ticket, a
// diferencia de los adjuntos de comentarios
// que se envían en el chat. La ruta del archivo
// en el servidor FTP se guarda en
// ticket_evidence_path.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketEvidence = sequelize.define('TicketEvidence', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    ticket_evidence_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },

    // ============================================
    // CLAVE FORÁNEA
    // Vincula la evidencia al ticket al que
    // pertenece. Un ticket puede tener múltiples
    // archivos de evidencia.
    // ============================================
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },

    // ============================================
    // RUTA DEL ARCHIVO
    // Ruta en el servidor FTP donde se almacenó
    // el archivo procesado por ticketUpload.js.
    // Puede ser null si el registro se creó sin
    // archivo adjunto.
    // ============================================
    ticket_evidence_path: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: 'tickets_evidences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// ============================================
// ASOCIACIONES
// ============================================
TicketEvidence.associate = (models) => {
    TicketEvidence.belongsTo(models.Ticket, {
        foreignKey: 'ticket_id',
        as: 'ticket',
    });
};

module.exports = TicketEvidence;