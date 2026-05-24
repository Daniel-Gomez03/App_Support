// ============================================
// RUTAS: CATEGORÍAS
// CRUD completo para el catálogo de categorías
// de productos. Todas las rutas requieren el
// permiso del módulo 'Q&A' ya que las categorías
// son compartidas entre productos y FAQs.
//
// GET    /categories              → getAllCategories       (read)
// GET    /categories/inactives    → getAllCategoriesInactives (read)
// GET    /categories/:id          → getCategoryById        (read)
// POST   /categories              → createCategory         (write)
// PUT    /categories/:id          → updateCategory         (edit)
// DELETE /categories/:id          → deleteCategory         (edit)
// PATCH  /categories/:id/toggle   → toggleCategoryStatus   (edit)
// ============================================

const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/categoryController');
const authorize = require('../Middleware/authorize');

router.get('/categories',
    authorize('Q&A', 'permissions_read'),
    categoryController.getAllCategories
);

router.get('/categories/inactives',
    authorize('Q&A', 'permissions_read'),
    categoryController.getAllCategoriesInactives
);

router.get('/categories/:id',
    authorize('Q&A', 'permissions_read'),
    categoryController.getCategoryById
);

router.post('/categories',
    authorize('Q&A', 'permissions_write'),
    categoryController.createCategory
);

router.put('/categories/:id',
    authorize('Q&A', 'permissions_edit'),
    categoryController.updateCategory
);

router.delete('/categories/:id',
    authorize('Q&A', 'permissions_edit'),
    categoryController.deleteCategory
);

router.patch('/categories/:id/toggle',
    authorize('Q&A', 'permissions_edit'),
    categoryController.toggleCategoryStatus
);

module.exports = router;