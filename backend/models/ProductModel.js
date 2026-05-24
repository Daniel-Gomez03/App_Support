// ============================================
// MODELO: PRODUCTMODEL
// Representa los modelos específicos dentro de
// un producto. Permite clasificar
// tickets y FAQs con mayor granularidad que
// solo el producto. El nombre del modelo tiene
// restricción UNIQUE para evitar duplicados
// entre distintos productos del catálogo.
// Los modelos inactivos se conservan por
// historial y no aparecen en los selectores.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductModel = sequelize.define('ProductModel', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    product_model_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    // ============================================
    // PRODUCTO PADRE
    // Clave foránea al producto al que pertenece
    // este modelo. Un producto puede tener
    // múltiples modelos activos e inactivos.
    // ============================================
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    // ============================================
    // NOMBRE DEL MODELO
    // UNIQUE a nivel de BD para garantizar que
    // no existan dos modelos con el mismo nombre,
    // independientemente del producto al que
    // pertenezcan. Longitud máxima de 100 chars.
    // ============================================
    product_model_name: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
    },

    // ============================================
    // ESTADO (activo / inactivo)
    // ============================================
    product_model_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false,
    },
}, {
    tableName: 'products_models',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// ============================================
// ASOCIACIONES
// ============================================
ProductModel.associate = (models) => {
    ProductModel.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
    });
};

module.exports = ProductModel;