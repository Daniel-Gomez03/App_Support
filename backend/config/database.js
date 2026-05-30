// ============================================
// CONFIGURACIÓN DE LA BASE DE DATOS
// Conexión a MySQL mediante Sequelize ORM.
// Las credenciales se leen desde variables de
// entorno definidas en el archivo .env
// ============================================

const { Sequelize } = require('sequelize');
require('dotenv').config();

// ============================================
// INSTANCIA DE SEQUELIZE
// ============================================
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT || 3306,
        // logging: false — descomentar para ocultar queries en consola
    }
);

module.exports = sequelize;