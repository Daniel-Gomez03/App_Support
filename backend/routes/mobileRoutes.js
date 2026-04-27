const express = require('express');
const router = express.Router();
const mobileController = require('../Controllers/mobileController');

router.post('/mobile/login', mobileController.mobileLogin);
router.post('/mobile/register', mobileController.mobileRegister);
router.get('/mobile/validate-warranty', mobileController.validateWarranty);
router.get('/mobile/warranty-policy', mobileController.getWarrantyPolicy);
router.post('/mobile/forgot-password', mobileController.forgotPassword);
router.post('/mobile/reset-password', mobileController.resetPassword);
router.get('/mobile/reset-redirect', mobileController.resetRedirect);

module.exports = router;