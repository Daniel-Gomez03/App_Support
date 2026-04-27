const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketStatus = sequelize.define('TicketStatus', {
    ticket_status_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ticket_status_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    ticket_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
    }
}, {
    tableName: 'tickets_statuses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

//Asociacion 
TicketStatus.associate = (models) => {
    TicketStatus.hasMany(models.Ticket, {
        foreignKey: 'ticket_status_id',
        as: 'tickets'
    });
};

module.exports = TicketStatus;