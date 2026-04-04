const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    category_description: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    category_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1
    }
}, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Category;