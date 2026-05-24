// ============================================
// RUTAS: CALIFICACIONES
// Expone el listado de calificaciones enviadas
// por los clientes sobre sus tickets. Es de
// solo lectura desde el panel; las calificaciones
// se crean exclusivamente desde la app móvil
// (POST /mobile/tickets/:id/rating en mobileRoutes).
//
// GET /ratings → getRatings (read)
// ============================================

const express = require('express');
const router = express.Router();
const ratingController = require('../Controllers/ratingController');
const authorize = require('../Middleware/authorize');

router.get('/ratings',
    authorize('Comentarios', 'permissions_read'),
    ratingController.getRatings
);

module.exports = router;