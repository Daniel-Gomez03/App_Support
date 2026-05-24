// ============================================
// MODELO: PERMISSION
// Tabla de control de acceso granular por
// usuario y módulo. Cada fila representa los
// permisos de un usuario sobre un módulo del
// panel (Seccion). Los tres bits independientes
// permiten combinaciones como solo lectura,
// lectura+escritura, o acceso completo.
// El índice único (user_id, module_id) garantiza
// que haya como máximo un registro por par,
// lo que permite usar upsert para actualizar
// permisos sin duplicarlos.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    permissions_id: {
        type: DataTypes.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },

    // ============================================
    // CLAVES FORÁNEAS
    // user_id referencia al usuario del panel.
    // module_id referencia al módulo (Seccion).
    // Juntos forman la clave única del registro.
    // ============================================
    user_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    module_id: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
    },

    // ============================================
    // BITS DE PERMISO
    // 0 = denegado, 1 = permitido.
    // permissions_read:  ver listados y detalles.
    // permissions_write: crear nuevos registros.
    // permissions_edit:  modificar y eliminar.
    // El middleware authorize() evalúa el campo
    // correspondiente al tipo de operación.
    // ============================================
    permissions_read: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
    },
    permissions_write: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
    },
    permissions_edit: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
    },
}, {
    tableName: 'permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'module_id'],
            name: 'uidx_user_module',
        },
    ],
});

// ============================================
// ASOCIACIONES
// ============================================
Permission.associate = (models) => {
    Permission.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
    });
    Permission.belongsTo(models.Seccion, {
        foreignKey: 'module_id',
        as: 'Seccion',
    });
};

module.exports = Permission;