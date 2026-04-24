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