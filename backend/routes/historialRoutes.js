// ============================================
// RUTAS: HISTORIAL DE TICKETS
// Expone los tickets cerrados o archivados para
// consulta y corrección de datos históricos.
// El PUT permite editar un ticket del historial
// sin reabrirlo (ej. corregir campos de registro).
//
// GET /historial      → getHistorialTickets  (read)
// PUT /historial/:id  → updateHistorialTicket (edit)
// ============================================

const express = require('express');
const router = express.Router();
const historialController = require('../Controllers/historialController');
const authorize = require('../Middleware/authorize');

router.get('/historial',
    authorize('Historial', 'permissions_read'),
    historialController.getHistorialTickets
);

router.put('/historial/:id',
    authorize('Historial', 'permissions_edit'),
    historialController.updateHistorialTicket
);

module.exports = router;