// ============================================
// MODELO: CATEGORY
// Representa las categorías que agrupan los
// productos del catálogo de soporte. Cada
// producto pertenece a una categoría activa.
// Las categorías inactivas (category_status=0)
// se conservan por historial y no aparecen
// en los formularios de creación de tickets.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    // ============================================
    // NOMBRE Y DESCRIPCIÓN
    // Longitud máxima de 50 caracteres para
    // mantener consistencia con el diseño del
    // formulario y el ancho de las columnas en
    // las tablas del panel.
    // ============================================
    category_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    category_description: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },

    // ============================================
    // ESTADO (activo / inactivo)
    // 1 = activa, 0 = inactiva. Se usa BOOLEAN
    // pero se inicializa con 1 (entero) para
    // compatibilidad con la columna TINYINT(1)
    // de MySQL sin requerir casting manual.
    // ============================================
    category_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
    },
}, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Category;