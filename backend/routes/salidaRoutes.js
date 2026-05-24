// ============================================
// RUTAS: SALIDAS DE EQUIPO
// Gestiona las solicitudes de salida de equipos
// asociadas a tickets. El flujo es: el técnico
// consulta sus tickets disponibles, crea la
// solicitud y el supervisor cambia el estado
// (Pendiente → Aprobada/Rechazada).
//
// GET   /salidas                    → getAllSalidas       (read)
// GET   /salidas/tickets/:userId    → getTicketsByUser   (read)
// POST  /salidas                    → createSalida       (write)
// PATCH /salidas/:id/status         → updateSalidaStatus (edit)
// ============================================

const express = require('express');
const router = express.Router();
const salidaController = require('../Controllers/salidaController');
const authorize = require('../Middleware/authorize');

router.get('/salidas',
    authorize('Salidas', 'permissions_read'),
    salidaController.getAllSalidas
);

router.get('/salidas/tickets/:userId',
    authorize('Salidas', 'permissions_read'),
    salidaController.getTicketsByUser
);

router.post('/salidas',
    authorize('Salidas', 'permissions_write'),
    salidaController.createSalida
);

router.patch('/salidas/:id/status',
    authorize('Salidas', 'permissions_edit'),
    salidaController.updateSalidaStatus
);

module.exports = router;