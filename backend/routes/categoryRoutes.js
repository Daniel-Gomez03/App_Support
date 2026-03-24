const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/categoryController');

router.get('/categories', categoryController.getAllCategories);
router.get('/categories/inactives', categoryController.getAllCategoriesInactives);
router.get('/categories/:id', categoryController.getCategoryById);


router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);
router.patch('/categories/:id/toggle', categoryController.toggleCategoryStatus);

module.exports = router;