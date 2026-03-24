const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Faq = sequelize.define('Faq', {
    faq_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_model_id: {
        type: DataTypes.INTEGER
    },
    faq_question: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    faq_answer:{
        type: DataTypes.TEXT,
        allowNull:false
    }, 
    faq_video_url: {
        type: DataTypes.STRING(255),
        allowNull: false

    },
    faq_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
    },
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