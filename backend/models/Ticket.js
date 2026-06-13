// ============================================
// MODELO: TICKET
// Entidad central del sistema de soporte.
// Representa una solicitud de asistencia técnica
// creada por un cliente desde la app móvil.
// Cada ticket está clasificado por categoría,
// producto y opcionalmente modelo, y tiene un
// estado de flujo (ticket_status_id) que avanza
// a medida que los técnicos trabajan en él.
// El campo ticket_status (BOOLEAN) indica si el
// registro está activo en el sistema; es distinto
// de ticket_status_id que representa el estado
// del flujo de trabajo. Los técnicos asignados
// se gestionan a través de la tabla intermedia
// TicketAssignment (relación N:M con User).
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },

    // ============================================
    // CLAVES FORÁNEAS DE CLASIFICACIÓN
    // customer_id: cliente que abrió el ticket.
    // category_id / product_id: clasificación del
    // equipo reportado. product_model_id es opcional
    // para tickets donde no se especifica modelo.
    // ticket_status_id: estado actual del flujo
    // (referencia a la tabla ticket_statuses).
    // ============================================
    customer_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    category_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    product_model_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: true,
    },
    ticket_status_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },

    // ============================================
    // ASIGNACIÓN Y PRIORIDAD
    // ticket_priority clasifica la urgencia del
    // caso (ej. Baja, Media, Alta). ticket_due_date
    // es la fecha límite de resolución asignada
    // por el supervisor. assignment_remarks son
    // las indicaciones internas al asignar técnicos.
    // ============================================
    ticket_priority: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    ticket_due_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    assignment_remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },

    // ============================================
    // CONTENIDO DEL TICKET
    // ticket_subject es el título del problema.
    // ticket_description detalla el problema.
    // ticket_serial_number vincula el equipo a
    // un registro de garantía mediante el número
    // de serie (FK no convencional a Warranty).
    // ============================================
    ticket_subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    ticket_description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    ticket_serial_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },

    // ============================================
    // ESTADO DEL REGISTRO
    // ticket_status (BOOLEAN): 1=activo, 0=eliminado.
    // Es distinto de ticket_status_id (flujo).
    // ============================================
    ticket_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
    },

    // ============================================
    // CANCELACIÓN
    // cancellation_requested: el cliente solicitó
    // cancelar el ticket (flag 0/1). Se guarda el
    // estado de flujo previo en
    // cancellation_prev_status_id para poder
    // restaurarlo si la cancelación es rechazada.
    // ============================================
    cancellation_requested: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
    },
    cancellation_prev_status_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: true,
        defaultValue: null,
    },

    // ============================================
    // CHAT
    // chat_paused: cuando es 1, el chat del ticket
    // está pausado y no acepta nuevos mensajes.
    // Permite controlar la comunicación en estados
    // cerrados o en proceso de cancelación.
    // ============================================
    chat_paused: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// ============================================
// ASOCIACIONES
// belongsTo: Customer, Category, Product,
//   ProductModel (opcional), TicketStatus,
//   Warranty (FK no convencional por serial).
// belongsToMany: User a través de TicketAssignment
//   (técnicos asignados al ticket).
// hasMany: TicketEvidence, TicketComment, Rating.
// ============================================
Ticket.associate = (models) => {
    Ticket.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer',
    });

    Ticket.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
    });

    Ticket.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
    });

    Ticket.belongsTo(models.ProductModel, {
        foreignKey: 'product_model_id',
        as: 'productModel',
    });

    Ticket.belongsTo(models.TicketStatus, {
        foreignKey: 'ticket_status_id',
        as: 'status',
    });

    // FK no convencional: vincula por número de serie
    // en lugar de por ID para cruzar con la garantía.
    Ticket.belongsTo(models.Warranty, {
        foreignKey: 'ticket_serial_number',
        targetKey: 'warranty_serial_number',
        as: 'warranty',
    });

    Ticket.belongsToMany(models.User, {
        through: models.TicketAssignment,
        foreignKey: 'ticket_id',
        otherKey: 'user_id',
        as: 'assignedUsers',
    });

    Ticket.hasMany(models.TicketEvidence, {
        foreignKey: 'ticket_id',
        as: 'evidences',
    });

    Ticket.hasMany(models.TicketComment, {
        foreignKey: 'ticket_id',
        as: 'comments',
    });

    Ticket.hasMany(models.Rating, {
        foreignKey: 'ticket_id',
        as: 'ratings',
    });
};

module.exports = Ticket;