// ============================================
// MODELO: CUSTOMER
// Representa a los clientes que acceden a la
// app móvil para crear y seguir sus tickets.
// El registro puede originarse por dos vías
// (customer_registration_type): registro manual
// con contraseña o SSO. Solo
// los clientes con email verificado y estado
// activo pueden autenticarse en la app móvil.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
    // ============================================
    // IDENTIFICADOR
    // BIGINT UNSIGNED para soportar un volumen
    // alto de clientes sin riesgo de desbordamiento.
    // ============================================
    customer_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },

    // ============================================
    // NOMBRE COMPLETO
    // Segundo nombre y segundo apellido son
    // opcionales (null) para adaptarse a nombres
    // de distintas regiones y convenciones.
    // ============================================
    customer_first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    customer_second_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null,
    },
    customer_last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    customer_second_last_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null,
    },

    // ============================================
    // CONTACTO
    // Email y teléfono con restricción UNIQUE para
    // evitar cuentas duplicadas. El código de país
    // se almacena separado del número para facilitar
    // el formateo internacional en la app.
    // ============================================
    customer_email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    customer_country_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    customer_phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    customer_company: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    customer_registration_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: null,
    },
    customer_registration_value: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: null,
    },

    // ============================================
    // CREDENCIALES
    // Contraseña hash (bcrypt). Null en registros
    // OAuth ya que la autenticación es delegada al
    // proveedor. customer_image almacena la URL de
    // la foto de perfil (FTP).
    // ============================================
    customer_password: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
    },
    customer_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
    },

    // ============================================
    // POLÍTICA DE GARANTÍA
    // Registra la versión aceptada y el timestamp
    // de aceptación para cumplimiento legal.
    // Null si el cliente aún no ha aceptado.
    // ============================================
    accepted_policy_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    accepted_policy_version: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null,
    },

    // ============================================
    // ESTADO Y VERIFICACIÓN
    // customer_status: 1=activo, 0=inactivo/pendiente.
    // email_verified: 0 hasta confirmar el email;
    // los clientes no verificados no pueden acceder.
    // verification_token y su expiración se limpian
    // tras la confirmación exitosa del correo.
    // ============================================
    customer_status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 1,
        allowNull: true,
    },
    email_verified: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
        allowNull: true,
    },
    verification_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
    },
    verification_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },

    // ============================================
    // RECUPERACIÓN DE CONTRASEÑA
    // Token de un solo uso generado al solicitar
    // el restablecimiento. Se invalida por expiración
    // o tras el cambio exitoso de contraseña.
    // ============================================
    reset_password_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
    },
    reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
}, {
    tableName: 'customers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// ============================================
// ASOCIACIONES
// ============================================
Customer.associate = (models) => {
    Customer.hasMany(models.TicketComment, {
        foreignKey: 'customer_id',
        as: 'comments',
    });
};

module.exports = Customer;