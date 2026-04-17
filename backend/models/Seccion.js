const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Seccion = sequelize.define('Seccion', {
    module_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    module_name: {
        type: DataTypes.STRING(70),
        allowNull: false
    },
    module_status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 1
    }
}, {
    tableName: 'modules',
    timestamps: false
});

// Asociación
Seccion.associate = (models) => {
    Seccion.hasMany(models.Permission, {
        foreignKey: 'module_id',
        as: 'permissions'
    });
};

module.exports = Seccion;