const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
    customer_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    customer_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    customer_email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    customer_country_code: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    customer_phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    customer_company: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    customer_password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    customer_image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    customer_status: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verification_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    verification_token_expires: {
        type: DataTypes.DATE,
        allowNull: true
    },
}, {
    tableName: 'customers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Customer;