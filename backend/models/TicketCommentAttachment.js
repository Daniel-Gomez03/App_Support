// ============================================
// MODELO: TICKETCOMMENTATTACHMENT
// Almacena los archivos adjuntos enviados en
// los mensajes del chat de un ticket. Cada
// adjunto pertenece a un único comentario y
// guarda la ruta del archivo en el servidor
// FTP (file_path) y el nombre original del
// archivo para mostrarlo en la UI (file_name).
// No tiene updatedAt porque los adjuntos no
// se modifican tras ser subidos.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketCommentAttachment = sequelize.define('TicketCommentAttachment', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    attachment_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },

    // ============================================
    // CLAVE FORÁNEA
    // Vincula el adjunto al comentario al que
    // pertenece. Un comentario puede tener
    // múltiples adjuntos.
    // ============================================
    comment_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },

    // ============================================
    // DATOS DEL ARCHIVO
    // file_path: ruta completa en el servidor FTP
    // donde está almacenado el archivo. 500 chars
    // para acomodar rutas largas con subdirectorios.
    // file_name: nombre original del archivo tal
    // como lo subió el usuario, usado para mostrar
    // en la UI y para la descarga.
    // ============================================
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    tableName: 'ticket_comment_attachments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

// ============================================
// ASOCIACIONES
// ============================================
TicketCommentAttachment.associate = (models) => {
    TicketCommentAttachment.belongsTo(models.TicketComment, {
        foreignKey: 'comment_id',
        as: 'comment',
    });
};

module.exports = TicketCommentAttachment;