const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketAssignment = sequelize.define('TicketAssignment', {
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        allowNull: false
    }
}, {
    tableName: 'ticket_assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

//Asociaciones

module.exports = TicketAssignment;