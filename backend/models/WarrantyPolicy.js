const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WarrantyPolicy = sequelize.define('WarrantyPolicy', {
    policy_id: {
        type:          DataTypes.INTEGER.UNSIGNED,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
    },
    policy_version: {
        type:      DataTypes.STRING(20),
        allowNull: false,
    },
    policy_updated_label: {
        type:      DataTypes.STRING(50),
        allowNull: false,
    },
    policy_content: {
        type:      DataTypes.JSON,
        allowNull: false,
    },
    policy_is_active: {
        type:         DataTypes.TINYINT(1),
        allowNull:    false,
        defaultValue: 1,
    },
}, {
    tableName:  'warranty_policy',
    timestamps: true,
    createdAt:  'created_at',
    updatedAt:  'updated_at',
});

module.exports = WarrantyPolicy;