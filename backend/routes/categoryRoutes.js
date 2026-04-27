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