const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    customer_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false
    },
    category_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false
    },
    product_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false
    },
    product_model_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: true
    },
    ticket_status_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false
    },
    ticket_priority: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    ticket_due_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    assignment_remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    ticket_subject: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    ticket_description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ticket_serial_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    ticket_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Asociacion
Ticket.associate = (models) => {
    Ticket.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
    });

    Ticket.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
    });

    Ticket.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
    });

    Ticket.belongsTo(models.ProductModel, {
        foreignKey: 'product_model_id',
        as: 'productModel'
    });

    Ticket.belongsTo(models.TicketStatus, {
        foreignKey: 'ticket_status_id',
        as: 'status'
    });

    Ticket.belongsTo(models.Warranty, {
        foreignKey: 'ticket_serial_number',
        targetKey: 'warranty_serial_number',
        as: 'warranty'
    });

    Ticket.belongsToMany(models.User, {
        through: models.TicketAssignment,
        foreignKey: 'ticket_id',
        otherKey: 'user_id',
        as: 'assignedUsers'
    });

    Ticket.hasMany(models.TicketEvidence, {
        foreignKey: 'ticket_id',
        as: 'evidences'
    });

    Ticket.hasMany(models.TicketComment, {
        foreignKey: 'ticket_id',
        as: 'comments'
    });
};

module.exports = Ticket;