// ============================================
// CONTROLADOR DE CATEGORÍAS
// CRUD completo para las categorías del sistema.
// Cada operación de escritura emite un evento
// Socket.io para que el frontend actualice su
// estado en tiempo real sin recargar la página.
// ============================================

const Category = require('../models/Category');

// ============================================
// OBTENER TODAS LAS CATEGORÍAS
// Devuelve activas e inactivas ordenadas por
// nombre para uso en el panel de administración.
// ============================================
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['category_name', 'ASC']],
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER CATEGORÍAS INACTIVAS
// Usadas para mostrar el historial de elementos
// desactivados en las vistas de administración.
// ============================================
exports.getAllCategoriesInactives = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { category_status: false },
            order: [['category_name', 'ASC']],
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER CATEGORÍA POR ID
// ============================================
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Categoría no encontrada.' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR CATEGORÍA
// El nombre es obligatorio. El estado por
// defecto es activo salvo que se indique lo
// contrario. Emite 'category_created'.
// ============================================
exports.createCategory = async (req, res) => {
    try {
        const { category_name, category_description, category_status } = req.body;

        if (!category_name) {
            return res.status(400).json({ error: 'El nombre de la categoría es requerido.' });
        }

        const category = await Category.create({
            category_name,
            category_description: category_description || '',
            category_status: category_status !== false,
        });

        req.app.get('io').emit('category_created', category);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR CATEGORÍA
// Solo reemplaza los campos enviados en el body;
// los omitidos conservan su valor actual.
// Emite 'category_updated'.
// ============================================
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Categoría no encontrada.' });

        const { category_name, category_description, category_status } = req.body;

        await category.update({
            category_name: category_name ?? category.category_name,
            category_description: category_description !== undefined ? category_description : category.category_description,
            category_status: category_status !== undefined ? category_status : category.category_status,
        });

        req.app.get('io').emit('category_updated', category);
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR CATEGORÍA
// Eliminación física. Emite 'category_deleted'
// con el ID para que el frontend retire la
// tarjeta de la vista sin recargar.
// ============================================
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Categoría no encontrada.' });

        const categoryId = category.category_id;
        await category.destroy();

        req.app.get('io').emit('category_deleted', { category_id: categoryId });
        res.json({ message: 'Categoría eliminada.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CAMBIAR ESTADO DE CATEGORÍA (toggle)
// Invierte el estado activo/inactivo usando
// update() en lugar de save() para seguir el
// patrón estándar de Sequelize.
// Emite 'category_status_updated'.
// ============================================
exports.toggleCategoryStatus = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Categoría no encontrada.' });

        await category.update({ category_status: !category.category_status });

        req.app.get('io').emit('category_status_updated', {
            category_id: category.category_id,
            new_status: category.category_status,
        });

        res.json({
            message: 'Estado actualizado.',
            category_name: category.category_name,
            new_status: category.category_status,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};