const express = require('express');
const router = express.Router();
const productModelController = require('../Controllers/productModelController');
const upload = require('../Middleware/upload');

router.get('/product-models', productModelController.getAllProductsModels);
router.get('/product-models/inactives', productModelController.getAllProductsModelsInactives);
router.get('/product-models/:id', productModelController.getAllProductsModelsById);
router.get('/product/:product_id/models', productModelController.getProductsModelsByProductId);

router.post('/product-models', productModelController.createProductModel);
router.put('/product-models/:id', productModelController.updateProductModel);
router.delete('/product-models/:id', productModelController.deleteProductModel);
router.patch('/product-models/:id/toggle', productModelController.toggleProductModelStatus);
router.post('/product-models/bulk-upload', upload.single('file'), productModelController.bulkUploadProductsModels);

module.exports = router;