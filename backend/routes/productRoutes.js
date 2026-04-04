const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController')
const upload = require('../Middleware/upload');

router.get('/products', productController.getAllProducts);
router.get('/products/inactives', productController.getAllProductsInactives)
router.get('/products/:id', productController.getProductById);

router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.patch('/products/:id/toggle', productController.toggleProductStatus);
router.post('/products/bulk-upload', upload.single('file'), productController.bulkUploadProducts);

module.exports = router;