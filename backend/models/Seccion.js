// ============================================
// MODELO: SECCION (módulo del panel)
// Representa cada módulo o sección del panel
// web (ej. Tickets, Clientes, FAQs). Es la
// referencia central del sistema de permisos:
// la tabla permissions asocia usuarios a
// secciones para definir qué puede hacer cada
// uno dentro de cada módulo. Las secciones
// inactivas (module_status=0) quedan ocultas
// en el panel pero sus permisos se conservan.
// No tiene timestamps porque los módulos son
// datos de configuración que raramente cambian.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Seccion = sequelize.define('Seccion', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    module_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },

    // ============================================
    // NOMBRE DEL MÓDULO
    // Nombre legible que el middleware authorize()
    // usa para localizar la sección por nombre
    // antes de verificar el permiso del usuario.
    // ============================================
    module_name: {
        type: DataTypes.STRING(70),
        allowNull: false,
    },

    // ============================================
    // ESTADO (activo / inactivo)
    // ============================================
    module_status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 1,
    },
}, {
    tableName: 'modules',
    timestamps: false,
});

// ============================================
// ASOCIACIONES
// Un módulo puede tener muchos registros de
// permisos (uno por usuario que tenga acceso
// configurado a esta sección).
// ============================================
Seccion.associate = (models) => {
    Seccion.hasMany(models.Permission, {
        foreignKey: 'module_id',
        as: 'permissions',
    });
};

module.exports = Seccion;