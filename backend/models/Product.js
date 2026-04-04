const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
    }, 
    product_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    product_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Asociación
Product.associate = (models) => {
    Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
};

module.exports = Product;