const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketCommentAttachment = sequelize.define('TicketCommentAttachment', {
    attachment_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    comment_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    file_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    tableName: 'ticket_comment_attachments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

TicketCommentAttachment.associate = (models) => {
    TicketCommentAttachment.belongsTo(models.TicketComment, {
        foreignKey: 'comment_id',
        as: 'comment'
    });
};

module.exports = TicketCommentAttachment;