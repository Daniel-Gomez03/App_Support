const express = require('express');
const router = express.Router();
const mobileController = require('../Controllers/mobileController');
const mobileAuth = require('../Middleware/mobileAuth');
const { upload } = require('../Middleware/ticketUpload');

// Rutas públicas (sin token)
router.post('/mobile/login', mobileController.mobileLogin);
router.post('/mobile/register', mobileController.mobileRegister);
router.post('/mobile/forgot-password', mobileController.forgotPassword);
router.post('/mobile/reset-password', mobileController.resetPassword);
router.get('/mobile/reset-redirect', mobileController.resetRedirect);
router.get('/mobile/validate-warranty', mobileController.validateWarranty);
router.get('/mobile/warranty-policy', mobileController.getWarrantyPolicy);

// Rutas protegidas (requieren token de cliente)
router.get('/mobile/faqs',                          mobileAuth, mobileController.getMobileFaqs);
router.get('/mobile/categories',                    mobileAuth, mobileController.getMobileCategories);
router.get('/mobile/categories/:category_id/products', mobileAuth, mobileController.getMobileProductsByCategory);
router.get('/mobile/products/:product_id/models',   mobileAuth, mobileController.getMobileModelsByProduct);
router.post('/mobile/tickets', mobileAuth, upload.array('evidences', 5), mobileController.createMobileTicket);

module.exports = router;