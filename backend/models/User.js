const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: false
    },
    nombre_completo: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    correo: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    rol: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    cargo: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    area: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    foto: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fecha_ingreso_soporte: {
        type: DataTypes.DATE,
        allowNull: true
    },
    estado: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    },
    racha_actual: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    racha_perdida: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ultima_conexion: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Asociación
User.associate = (models) => {
    User.hasMany(models.Ticket, {
        foreignKey: 'user_id',
        as: 'assignedTickets'
    });
    User.hasMany(models.Permission, {
        foreignKey: 'user_id',
        as: 'Permissions'
    });
};

module.exports = User;