// ============================================
// MODELO: WARRANTY
// Representa el registro de garantía de un
// equipo identificado por su número de serie.
// La vigencia de la garantía es de 1 año desde
// la fecha de compra; los campos warranty_expiry_date
// e is_expired son VIRTUAL y se calculan en tiempo
// real a partir de warranty_purchase_date sin
// persistir nada extra en la BD.
// La asociación con Ticket usa una FK no
// convencional (número de serie en lugar de ID)
// para que los tickets puedan cruzarse con la
// garantía sin requerir un campo warranty_id.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Warranty = sequelize.define('Warranty', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    warranty_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },

    // ============================================
    // IDENTIFICADORES DEL EQUIPO
    // Ambos son UNIQUE: un equipo tiene un único
    // número de serie y una única factura.
    // warranty_serial_number es la FK que usa
    // Ticket para cruzar con esta tabla.
    // ============================================
    warranty_serial_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
    },
    warranty_invoice_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
    },

    // ============================================
    // FECHA DE COMPRA
    // Base de cálculo para los campos VIRTUAL.
    // La garantía vence exactamente 1 año después.
    // ============================================
    warranty_purchase_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },

    // ============================================
    // ESTADO (activo / inactivo)
    // ============================================
    warranty_status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false,
    },

    // ============================================
    // CAMPOS VIRTUALES (calculados, no persistidos)
    // warranty_expiry_date: fecha de vencimiento
    // como string 'YYYY-MM-DD', calculada sumando
    // 1 año a warranty_purchase_date. Normaliza
    // tanto Date objects como strings de MySQL.
    // is_expired: true si hoy supera la fecha de
    // vencimiento. Compara a medianoche para evitar
    // falsos positivos por diferencia de horas.
    // ============================================
    warranty_expiry_date: {
        type: DataTypes.VIRTUAL,
        get() {
            const rawValue = this.getDataValue('warranty_purchase_date');
            if (!rawValue) return null;

            const dateStr = rawValue instanceof Date
                ? rawValue.toISOString().split('T')[0]
                : String(rawValue).split(' ')[0];

            const [year, month, day] = dateStr.split('-');

            const expiryYear = parseInt(year) + 1;

            return `${expiryYear}-${month}-${day}`;
        },
    },
    is_expired: {
        type: DataTypes.VIRTUAL,
        get() {
            const rawValue = this.getDataValue('warranty_purchase_date');
            if (!rawValue) return true;

            const dateStr = rawValue instanceof Date
                ? rawValue.toISOString().split('T')[0]
                : String(rawValue).split(' ')[0];

            const [year, month, day] = dateStr.split('-');

            const expiry = new Date(parseInt(year) + 1, parseInt(month) - 1, parseInt(day));

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            expiry.setHours(0, 0, 0, 0);

            return today > expiry;
        },
    },
}, {
    tableName: 'warranties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// ============================================
// ASOCIACIONES
// FK no convencional: los tickets se relacionan
// por número de serie (sourceKey) en lugar de
// por warranty_id, permitiendo consultar el
// historial de tickets de un equipo.
// ============================================
Warranty.associate = (models) => {
    Warranty.hasMany(models.Ticket, {
        foreignKey: 'ticket_serial_number',
        sourceKey: 'warranty_serial_number',
        as: 'history',
    });
};

module.exports = Warranty;