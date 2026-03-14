const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Obtener todas las categorías
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/categories/inactives', async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { category_status: false }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Obtener categoría por ID
router.get('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear categoría
router.post('/categories', async (req, res) => {
    try {
        const { category_name, category_description, category_status } = req.body;

        if (!category_name) {
            return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
        }

        const category = await Category.create({
            category_name,
            category_description: category_description || '',
            category_status: category_status !== false
        });

        const io = req.app.get('io');
        io.emit('category_created', category);

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar categoría
router.put('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

        const { category_name, category_description, category_status } = req.body;

        await category.update({
            category_name: category_name || category.category_name,
            category_description: category_description !== undefined ? category_description : category.category_description,
            category_status: category_status !== undefined ? category_status : category.category_status
        });

        const io = req.app.get('io');
        io.emit('category_updated', category);

        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar categoría
router.delete('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

        const categoryId = category.category_id;
        await category.destroy();

        const io = req.app.get('io');
        io.emit('category_deleted', {
            category_id: categoryId
        });
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Cambiar de estado la categoria
router.patch('/categories/:id/toggle', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

        category.category_status = !category.category_status;
        await category.save();

        const io = req.app.get('io');
        io.emit('category_status_updated', {
            category_id: category.category_id,
            new_status: category.category_status
        });

        res.json({
            message: 'Estado actualizado',
            category_name: category.category_name,
            new_status: category.category_status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;