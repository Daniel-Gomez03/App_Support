// ============================================
// RUTAS: DASHBOARD
// Expone las métricas y estadísticas del panel.
// No requiere authorize() porque el dashboard
// es accesible para todos los usuarios autenticados
// independientemente de sus permisos por módulo.
// verificarToken ya se aplica globalmente en app.js.
//
// GET /dashboard/stats → getDashboardStats
// ============================================

const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/dashboardController');

router.get('/dashboard/stats', dashboardController.getDashboardStats);

module.exports = router;