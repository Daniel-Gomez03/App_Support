const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketComment = sequelize.define('TicketComment', {
    comment_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false
    },
    user_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: true,
        defaultValue: null
    },
    customer_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: true,
        defaultValue: null
    },
    comment_text: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'ticket_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

TicketComment.associate = (models) => {
    TicketComment.belongsTo(models.Ticket, {
        foreignKey: 'ticket_id',
        as: 'ticket'
    });

    TicketComment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'author'
    });

    TicketComment.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customerAuthor'
    });

    TicketComment.hasMany(models.TicketCommentAttachment, {
        foreignKey: 'comment_id',
        as: 'attachments'
    });
};

module.exports = TicketComment;