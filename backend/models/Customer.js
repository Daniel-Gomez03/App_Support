const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Customer = sequelize.define(
    "Customer",
    {
        customer_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        customer_first_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        customer_second_name: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
        },
        customer_last_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        customer_second_last_name: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
        },
        customer_email: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        customer_country_code: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        customer_phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        customer_company: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        customer_registration_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: null,
        },
        customer_registration_value: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: null,
        },
        customer_password: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: false,
            defaultValue: null,
        },
        customer_image: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        accepted_policy_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        accepted_policy_version: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
        },
        customer_status: {
            type: DataTypes.TINYINT(1),
            defaultValue: 1,
            allowNull: true,
        },
        email_verified: {
            type: DataTypes.TINYINT(1),
            defaultValue: 0,
            allowNull: true,
        },
        verification_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        verification_token_expires: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        reset_password_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        reset_password_expires: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        tableName: "customers",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
);

Customer.associate = (models) => {
    Customer.hasMany(models.TicketComment, {
        foreignKey: "customer_id",
        as: "comments",
    });
};

module.exports = Customer;
