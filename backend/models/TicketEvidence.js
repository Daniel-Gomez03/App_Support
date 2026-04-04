const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const TicketEvidence = sequelize.define('TicketEvidence', {
    ticket_evidence_id: {
        type: DataTypes.BIGINT(20).UNSIGNED, 
        primaryKey: true,
        autoIncrement: true
    },
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    ticket_evidence_path: {
        type: DataTypes.STRING(255),
        allowNull: false,
    }
}, {
    tableName: 'tickets_evidences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

//Asociacion
TicketEvidence.associate = (models) => {
    TicketEvidence.belongsTo(models.Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
};

module.exports = TicketEvidence;