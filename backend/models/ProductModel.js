const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductModel = sequelize.define('ProductModel', {
    product_model_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_model_name: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false

    },
    product_model_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
    }
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