const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Faq = sequelize.define('Faq', {
    faq_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    product_model_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    faq_question: DataTypes.STRING,
    faq_answer: DataTypes.TEXT,
    faq_video_url: DataTypes.STRING,
    faq_status: DataTypes.BOOLEAN
}, {
    tableName: 'faqs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Faq.associate = (models) => {
    Faq.belongsTo(models.Category, { 
        foreignKey: 'category_id', 
        as: 'category' 
    });
    Faq.belongsTo(models.Product, { 
        foreignKey: 'product_id', 
        as: 'product' 
    });
    Faq.belongsTo(models.ProductModel, { 
        foreignKey: 'product_model_id', 
        as: 'product_model',
        allowNull: true
    });
};

module.exports = Faq;