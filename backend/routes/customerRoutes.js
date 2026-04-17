const express = require('express');
const router = express.Router();
const customerController = require('../Controllers/customerController');
const { upload, resizeImage } = require('../Middleware/profileUpload');
const authorize = require('../Middleware/authorize');

// ============================================
// RUTAS DE AUTENTICACIÓN
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
// RUTAS DE CLIENTES
// ============================================
router.get('/customers',
    authorize('Usuarios', 'permissions_read'),
    customerController.getAllCustomers
);

router.get('/customers/:id',
    authorize('Usuarios', 'permissions_read'),
    customerController.getCustomerById
)

router.put('/customers/:id',
    authorize('Usuarios', 'permissions_edit'),
    upload.single('customer_image'),
    resizeImage,
    customerController.updateCustomer
)

router.patch('/customers/:id/toggle-status',
    authorize('Usuarios', 'permissions_edit'),
    customerController.toggleCustomerStatus
);

module.exports = router;