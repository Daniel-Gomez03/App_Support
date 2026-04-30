const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
    rating_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    ticket_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    customer_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    rating_score: {
        type: DataTypes.TINYINT,
        allowNull: false,
    },
    rating_comment: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
    },
}, {
    tableName: 'ratings',
    timestamps: true,
    createdAt: 'rating_createdAt',
    updatedAt: false,
});

module.exports = Rating;