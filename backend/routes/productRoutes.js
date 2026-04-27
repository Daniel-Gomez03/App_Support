const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController')
const upload = require('../Middleware/upload');
const authorize = require('../Middleware/authorize');

router.get('/products',
    authorize('Q&A', 'permissions_read'),
    productController.getAllProducts
);

router.get('/products/inactives',
    authorize('Q&A', 'permissions_read'),
    productController.getAllProductsInactives
);

router.get('/products/:id',
    authorize('Q&A', 'permissions_read'),
    productController.getProductById
);

router.post('/products',
    authorize('Q&A', 'permissions_write'),
    productController.createProduct
);

router.put('/products/:id',
    authorize('Q&A', 'permissions_edit'),
    productController.updateProduct
);

router.delete('/products/:id',
    authorize('Q&A', 'permissions_edit'),
    productController.deleteProduct
);

router.patch('/products/:id/toggle',
    authorize('Q&A', 'permissions_edit'),
    productController.toggleProductStatus
);

router.post('/products/bulk-upload',
    authorize('Q&A', 'permissions_write'),
    upload.single('file'), productController.bulkUploadProducts
);

module.exports = router;