const express = require('express');
const router = express.Router();
const productModelController = require('../Controllers/productModelController');
const upload = require('../Middleware/upload');
const authorize = require('../Middleware/authorize');

router.get('/product-models',
    authorize('Q&A', 'permissions_read'),
    productModelController.getAllProductsModels
);

router.get('/product-models/inactives',
    authorize('Q&A', 'permissions_read'),
    productModelController.getAllProductsModelsInactives
);
router.get('/product-models/:id',
    authorize('Q&A', 'permissions_read'),
    productModelController.getAllProductsModelsById
);
router.get('/product/:product_id/models',
    authorize('Q&A', 'permissions_read'),
    productModelController.getProductsModelsByProductId
);

router.post('/product-models',
    authorize('Q&A', 'permissions_write'),
    productModelController.createProductModel
);

router.put('/product-models/:id',
    authorize('Q&A', 'permissions_edit'),
    productModelController.updateProductModel
);

router.delete('/product-models/:id',
    authorize('Q&A', 'permissions_edit'),
    productModelController.deleteProductModel
);

router.patch('/product-models/:id/toggle',
    authorize('Q&A', 'permissions_edit'),
    productModelController.toggleProductModelStatus
);

router.post('/product-models/bulk-upload',
    authorize('Q&A', 'permissions_write'),
    upload.single('file'),
    productModelController.bulkUploadProductsModels
);

module.exports = router;