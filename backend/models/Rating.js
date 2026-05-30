// ============================================
// MODELO: RATING
// Representa la calificación que un cliente
// emite sobre un ticket cerrado. Permite medir
// la satisfacción del servicio de soporte.
// Solo existe una calificación por ticket
// (la relación ticket_id + customer_id es de
// facto única en el flujo de la app). El campo
// rating_comment es opcional para que el cliente
// pueda calificar sin escribir un comentario.
// No tiene updatedAt porque una calificación
// enviada no se modifica.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    rating_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },

    // ============================================
    // CLAVES FORÁNEAS
    // ticket_id vincula la calificación al ticket
    // evaluado. customer_id identifica al cliente
    // que emitió la calificación (debe coincidir
    // con el propietario del ticket).
    // ============================================
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    customer_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },

    // ============================================
    // PUNTUACIÓN Y COMENTARIO
    // rating_score es un entero (ej. 1–5) que
    // representa la satisfacción del cliente.
    // rating_comment es texto libre opcional para
    // que el cliente explique su puntuación.
    // ============================================
    rating_score: {
        type: DataTypes.TINYINT,
        allowNull: false,
    },
    rating_comment: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
    },
}, {
    tableName: 'ratings',
    timestamps: true,
    createdAt: 'rating_createdAt',
    updatedAt: false,
});

// ============================================
// ASOCIACIONES
// ============================================
Rating.associate = (models) => {
    Rating.belongsTo(models.Ticket, {
        foreignKey: 'ticket_id',
        as: 'ticket',
    });

    Rating.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer',
    });
};

module.exports = Rating;