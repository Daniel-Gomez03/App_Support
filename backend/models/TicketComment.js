// ============================================
// MODELO: TICKETCOMMENT
// Representa los mensajes del chat interno de
// un ticket. El autor puede ser un técnico del
// panel (user_id) o el cliente de la app móvil
// (customer_id); exactamente uno de los dos
// tiene valor y el otro es null, según quién
// envió el mensaje. No tiene updatedAt porque
// los comentarios enviados no se modifican.
// Los archivos adjuntos al comentario se
// gestionan en TicketCommentAttachment.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketComment = sequelize.define('TicketComment', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    comment_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },

    // ============================================
    // CLAVES FORÁNEAS
    // ticket_id: ticket al que pertenece el mensaje.
    // user_id: técnico autor (null si lo envió el cliente).
    // customer_id: cliente autor (null si lo envió un técnico).
    // Solo uno de los dos tiene valor por comentario.
    // ============================================
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: true,
        defaultValue: null,
    },
    customer_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: true,
        defaultValue: null,
    },

    // ============================================
    // CONTENIDO
    // ============================================
    comment_text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: 'ticket_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

// ============================================
// ASOCIACIONES
// 'author' → técnico (User), puede ser null.
// 'customerAuthor' → cliente (Customer), puede ser null.
// 'attachments' → archivos adjuntos al mensaje.
// ============================================
TicketComment.associate = (models) => {
    TicketComment.belongsTo(models.Ticket, {
        foreignKey: 'ticket_id',
        as: 'ticket',
    });

    TicketComment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'author',
    });

    TicketComment.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customerAuthor',
    });

    TicketComment.hasMany(models.TicketCommentAttachment, {
        foreignKey: 'comment_id',
        as: 'attachments',
    });
};

module.exports = TicketComment;