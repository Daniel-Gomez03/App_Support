// ============================================
// MODELO: USER
// Representa a los técnicos y supervisores del
// panel web de soporte. A diferencia de Customer,
// el user_id NO es autoincrement: se asigna
// externamente (sincronizado con el portal
// de aplicativos). El rol y el cargo
// determinan qué acciones puede realizar el
// usuario en combinación con la tabla permissions.
// Las rachas (racha_actual / racha_perdida) son
// métricas de gamificación que registran la
// continuidad de tickets resueltos. Los usuarios
// inactivos (estado=0) no pueden autenticarse
// en el panel.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    // ============================================
    // IDENTIFICADOR
    // autoIncrement: false porque el ID se asigna
    // externamente desde el sistema corporativo,
    // no por la base de datos del sistema de soporte.
    // ============================================
    user_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
    },

    // ============================================
    // DATOS PERSONALES Y DE CONTACTO
    // correo tiene restricción UNIQUE para evitar
    // cuentas duplicadas. Es el campo usado para
    // autenticación en el panel web.
    // ============================================
    nombre_completo: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    correo: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },

    // ============================================
    // POSICIÓN EN LA EMPRESA
    // rol: define el nivel de acceso general
    // (ej. Admin, User).
    // cargo: título del puesto (ej. QA, UI/UX).
    // area: departamento al que pertenece.
    // ============================================
    rol: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    cargo: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    area: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },

    // ============================================
    // PERFIL
    // foto: URL de la imagen de perfil en el FTP.
    // fecha_ingreso_soporte: fecha en que el usuario
    // comenzó a operar en el sistema de soporte,
    // usada en reportes y en el perfil del técnico.
    // ============================================
    foto: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    fecha_ingreso_soporte: {
        type: DataTypes.DATE,
        allowNull: true,
    },

    // ============================================
    // ESTADO
    // 1 = activo, 0 = inactivo. Los usuarios
    // inactivos son rechazados por el middleware
    // verificarToken antes de acceder al panel.
    // ============================================
    estado: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
    },

    // ============================================
    // GAMIFICACIÓN
    // racha_actual: dias de conexion consecutivos
    // sin interrupciones. racha_perdida: contador
    // de rachas rotas acumuladas. Se actualizan
    // cada vez que se cierra o se pierde una racha.
    // ultima_conexion: timestamp de la última sesión
    // activa, usado en el dashboard de actividad.
    // ============================================
    racha_actual: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    racha_perdida: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    ultima_conexion: {
        type: DataTypes.DATE,
    },
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// ============================================
// ASOCIACIONES
// belongsToMany: tickets asignados al técnico
//   a través de TicketAssignment.
// hasMany Permissions: permisos de acceso por
//   módulo configurados para este usuario.
// hasMany TicketComment: mensajes enviados en
//   el chat de tickets por este técnico.
// ============================================
User.associate = (models) => {
    User.belongsToMany(models.Ticket, {
        through: models.TicketAssignment,
        foreignKey: 'user_id',
        otherKey: 'ticket_id',
        as: 'assignedTickets',
    });

    User.hasMany(models.Permission, {
        foreignKey: 'user_id',
        as: 'Permissions',
    });

    User.hasMany(models.TicketComment, {
        foreignKey: 'user_id',
        as: 'comments',
    });
};

module.exports = User;