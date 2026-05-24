// ============================================
// RUTAS: PRODUCTOS
// CRUD completo para el catálogo de productos
// del módulo Q&A. Incluye carga masiva desde
// archivo Excel/CSV para importar productos
// en lote sin crearlos uno a uno.
//
// GET    /products              → getAllProducts         (read)
// GET    /products/inactives    → getAllProductsInactives (read)
// GET    /products/:id          → getProductById         (read)
// POST   /products              → createProduct          (write)
// PUT    /products/:id          → updateProduct          (edit)
// DELETE /products/:id          → deleteProduct          (edit)
// PATCH  /products/:id/toggle   → toggleProductStatus    (edit)
// POST   /products/bulk-upload  → bulkUploadProducts     (write) + upload
// ============================================

const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController');
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
    upload.single('file'),
    productController.bulkUploadProducts
);

module.exports = router;