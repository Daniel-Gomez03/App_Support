const express = require('express');
const router = express.Router();
const customerController = require('../Controllers/customerController');
 
// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================
router.get('/verify-email',customerController.verifyEmail);
router.post('/register', customerController.register);
router.post('/login', customerController.login);

// ============================================
// RUTAS DE CLIENTES
// ============================================
router.get('/customers', customerController.getAllCustomers);
router.get('/customers/:id', customerController.getCustomerById);
router.put('/customers/:id', customerController.updateCustomer);
router.delete('/customers/:id', customerController.deleteCustomer);
router.patch('/customers/:id/toggle', customerController.toggleCustomerStatus);
 
module.exports = router;