// ============================================
// MODELO: FAQ
// Representa las preguntas frecuentes del
// sistema de soporte, organizadas por categoría
// y producto. Cada FAQ puede estar vinculada a
// un modelo específico de producto (opcional)
// para ofrecer respuestas más granulares.
// Las FAQs inactivas (faq_status=0) no se
// muestran en la app móvil ni en el panel.
// ============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Faq = sequelize.define('Faq', {
    // ============================================
    // IDENTIFICADOR
    // ============================================
    faq_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    // ============================================
    // CLASIFICACIÓN
    // category_id y product_id son obligatorios
    // para filtrar FAQs por contexto. product_model_id
    // es opcional: permite asociar la FAQ a un
    // modelo concreto dentro del producto, o dejarla
    // como respuesta genérica del producto completo.
    // ============================================
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_model_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    // ============================================
    // CONTENIDO
    // faq_question tiene límite de 255 caracteres
    // para mantener preguntas concisas. faq_answer
    // es TEXT para permitir respuestas detalladas.
    // faq_video_url apunta a un enlace de video
    // tutorial complementario (YouTube, etc.).
    // ============================================
    faq_question: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    faq_answer: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    faq_video_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },

    // ============================================
    // ESTADO (activo / inactivo)
    // ============================================
    faq_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false,
    },
}, {
    tableName: 'faqs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// ============================================
// ASOCIACIONES
// product_model_id puede ser null, por lo que
// la asociación a ProductModel es opcional en
// las consultas (required: false en los includes).
// ============================================
Faq.associate = (models) => {
    Faq.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
    });
    Faq.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
    });
    Faq.belongsTo(models.ProductModel, {
        foreignKey: 'product_model_id',
        as: 'product_model',
    });
};

module.exports = Faq;