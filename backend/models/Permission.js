const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
    permissions_id: {
        type: DataTypes.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
    },
    module_id: {
        type: DataTypes.BIGINT(20),
        allowNull: false
    },
    permissions_read: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0
    },
    permissions_write: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0
    },
    permissions_edit: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0
    }
}, {
    tableName: 'permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'module_id'],
            name: 'uidx_user_module'
        }
    ]
});

// Asociaciones 
Permission.associate = (models) => {
    Permission.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });
    Permission.belongsTo(models.Seccion, {
        foreignKey: 'module_id',
        as: 'Seccion'
    });
};

module.exports = Permission;