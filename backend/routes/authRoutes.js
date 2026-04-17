const express = require('express');
const router = express.Router();
const { portalLogin, getMe, logout } = require('../Controllers/authController');
const { verificarToken} = require('../Middleware/auth');


router.get('/me', verificarToken, getMe);


router.post('/portal-login', portalLogin);
router.post('/logout', logout);

module.exports = router;