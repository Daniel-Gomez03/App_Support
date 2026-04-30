const express = require('express');
const router  = express.Router();
const dashboardController = require('../Controllers/dashboardController');

// verificarToken ya está aplicado globalmente — Dashboard accesible para todos
router.get('/dashboard/stats', dashboardController.getDashboardStats);

module.exports = router;