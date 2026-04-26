const express = require('express');
const router  = express.Router();
const mobileController = require('../Controllers/mobileController');

// Rutas públicas — no requieren verificarToken
// Deben registrarse en app.js ANTES del middleware verificarToken

router.post('/mobile/login',             mobileController.mobileLogin);
router.post('/mobile/register',          mobileController.mobileRegister);
router.get('/mobile/validate-warranty',  mobileController.validateWarranty);
router.get('/mobile/warranty-policy',    mobileController.getWarrantyPolicy);
router.post('/mobile/forgot-password',   mobileController.forgotPassword);
router.post('/mobile/reset-password',    mobileController.resetPassword);
router.get('/mobile/reset-redirect',     mobileController.resetRedirect);

module.exports = router;