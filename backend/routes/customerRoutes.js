// ============================================
// RUTAS: CLIENTES
// Gestiona el registro y administración de
// clientes desde el panel web. El registro y
// la edición pasan por profileUpload para
// procesar la imagen de perfil (WebP 500×500)
// antes de llegar al controlador.
//
// --- Autenticación / verificación ---
// GET   /verify-email                      → verifyEmail            (público)
// POST  /customers/register-admin          → registerAdmin           (write) + upload
// POST  /customers/:id/verify-email        → sendVerificationEmailAdmin (write)
//
// --- CRUD de clientes ---
// GET   /customers                         → getAllCustomers         (read)
// GET   /customers/:id                     → getCustomerById        (read)
// PUT   /customers/:id                     → updateCustomer         (edit) + upload
// PATCH /customers/:id/toggle-status       → toggleCustomerStatus   (edit)
// ============================================

const express = require('express');
const router = express.Router();
const customerController = require('../Controllers/customerController');
const { upload, resizeImage } = require('../Middleware/profileUpload');
const authorize = require('../Middleware/authorize');

// ============================================
// AUTENTICACIÓN / VERIFICACIÓN
// ============================================
router.get('/verify-email', customerController.verifyEmail);

router.post('/customers/register-admin',
    authorize('Usuarios', 'permissions_write'),
    upload.single('customer_image'),
    resizeImage,
    customerController.registerAdmin
);

router.post('/customers/:id/verify-email',
    authorize('Usuarios', 'permissions_write'),
    customerController.sendVerificationEmailAdmin
);

// ============================================
// CRUD DE CLIENTES
// ============================================
router.get('/customers',
    authorize('Usuarios', 'permissions_read'),
    customerController.getAllCustomers
);

router.get('/customers/:id',
    authorize('Usuarios', 'permissions_read'),
    customerController.getCustomerById
);

router.put('/customers/:id',
    authorize('Usuarios', 'permissions_edit'),
    upload.single('customer_image'),
    resizeImage,
    customerController.updateCustomer
);

router.patch('/customers/:id/toggle-status',
    authorize('Usuarios', 'permissions_edit'),
    customerController.toggleCustomerStatus
);

module.exports = router;