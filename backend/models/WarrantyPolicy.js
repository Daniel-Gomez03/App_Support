// ============================================
// MODELO: WARRANTYPOLICY
// Almacena las versiones de la política de
// garantía que los clientes deben aceptar en
// la app móvil. Solo una versión debe estar
// activa (policy_is_active=1) a la vez; las
// anteriores se conservan por historial y para
// saber qué versión aceptó cada cliente
// (Customer.accepted_policy_version).
// El contenido de la política se guarda como
// JSON para permitir estructuras ricas (secciones,
// párrafos, listas) sin cambiar el esquema.
// policy_updated_label es la fecha legible que
// se muestra al cliente (ej. "Mayo 2025").
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WarrantyPolicy = sequelize.define('WarrantyPolicy', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    policy_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },

    // ============================================
    // VERSIÓN Y ETIQUETA
    // policy_version: identificador semántico de
    // la versión (ej. "1.0", "2.1") que se guarda
    // en Customer.accepted_policy_version al aceptar.
    // policy_updated_label: texto legible de la
    // fecha de actualización mostrado en la app
    // (ej. "Mayo 2025").
    // ============================================
    policy_version: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    policy_updated_label: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },

    // ============================================
    // CONTENIDO
    // JSON para estructurar la política en
    // secciones y párrafos sin alterar el esquema
    // de la tabla en cada actualización.
    // ============================================
    policy_content: {
        type: DataTypes.JSON,
        allowNull: false,
    },

    // ============================================
    // ESTADO
    // Solo la versión activa (policy_is_active=1)
    // se entrega a la app. Las versiones anteriores
    // quedan inactivas pero se conservan para
    // auditoría y para mostrar qué aceptó el cliente.
    // ============================================
    policy_is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
    },
}, {
    tableName: 'warranty_policy',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = WarrantyPolicy;