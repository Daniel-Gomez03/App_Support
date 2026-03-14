const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductModel = sequelize.define('ProductModel', {
    product_model_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: DataTypes.INTEGER,
    product_model_name: DataTypes.STRING,
    product_model_status: DataTypes.BOOLEAN
}, {
    tableName: 'products_models',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Asociación
ProductModel.associate = (models) => {
    ProductModel.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
};

module.exports = ProductModel;