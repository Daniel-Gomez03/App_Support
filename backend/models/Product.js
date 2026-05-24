// ============================================
// MODELO: PRODUCT
// Representa los productos del catálogo de
// soporte, agrupados bajo una categoría. Los
// productos son la base para clasificar tickets,
// FAQs y modelos específicos de equipos.
// Los productos inactivos (product_status=0)
// se conservan por historial pero no aparecen
// en los formularios del panel ni de la app.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    // ============================================
    // CLASIFICACIÓN
    // Clave foránea a Category. Define el grupo
    // al que pertenece el producto dentro del
    // catálogo (ej. Computadores, Impresoras).
    // ============================================
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    // ============================================
    // NOMBRE
    // Longitud máxima de 100 caracteres para
    // permitir nombres de producto descriptivos.
    // ============================================
    product_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    // ============================================
    // ESTADO (activo / inactivo)
    // ============================================
    product_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
    },
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// ============================================
// ASOCIACIONES
// ============================================
Product.associate = (models) => {
    Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
    });
};

module.exports = Product;