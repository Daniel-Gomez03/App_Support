// ============================================
// RUTAS: AUTENTICACIÓN DEL PANEL WEB
// Gestiona el ciclo de sesión de los usuarios
// del panel: login, verificación de sesión
// activa y logout. El token JWT viaja en una
// cookie httpOnly, por lo que el cliente no
// necesita enviarlo manualmente en cada petición.
//
// GET  /me            → verificarToken, getMe
// POST /portal-login  → portalLogin
// POST /logout        → logout
// ============================================

const express = require('express');
const router = express.Router();
const { portalLogin, getMe, logout } = require('../Controllers/authController');
const { verificarToken } = require('../Middleware/auth');

router.get('/me', verificarToken, getMe);

router.post('/portal-login', portalLogin);
router.post('/logout', logout);

module.exports = router;