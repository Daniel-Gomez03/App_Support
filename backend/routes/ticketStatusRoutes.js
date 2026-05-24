// ============================================
// RUTAS: ESTADOS DE TICKET
// CRUD para el catálogo de estados del flujo
// de trabajo de tickets. Se gestiona bajo el
// módulo 'Crear Ticket' porque los estados son
// parte de la configuración del flujo de alta
// y seguimiento de tickets.
//
// GET    /ticket-statuses              → getAllTicketStatuses         (read)
// GET    /ticket-statuses/inactives    → getAllTicketStatusesInactives (read)
// POST   /ticket-statuses              → createTicketStatus           (write)
// PUT    /ticket-statuses/:id          → updateTicketStatus           (edit)
// DELETE /ticket-statuses/:id          → deleteTicketStatus           (edit)
// PATCH  /ticket-statuses/toggle/:id   → toggleTicketStatus           (edit)
// ============================================

const express = require('express');
const router = express.Router();
const ticketStatusController = require('../Controllers/ticketStatusController');
const authorize = require('../Middleware/authorize');

router.get('/ticket-statuses',
    authorize('Crear Ticket', 'permissions_read'),
    ticketStatusController.getAllTicketStatuses
);

router.get('/ticket-statuses/inactives',
    authorize('Crear Ticket', 'permissions_read'),
    ticketStatusController.getAllTicketStatusesInactives
);

router.post('/ticket-statuses',
    authorize('Crear Ticket', 'permissions_write'),
    ticketStatusController.createTicketStatus
);

router.put('/ticket-statuses/:id',
    authorize('Crear Ticket', 'permissions_edit'),
    ticketStatusController.updateTicketStatus
);

router.delete('/ticket-statuses/:id',
    authorize('Crear Ticket', 'permissions_edit'),
    ticketStatusController.deleteTicketStatus
);

router.patch('/ticket-statuses/toggle/:id',
    authorize('Crear Ticket', 'permissions_edit'),
    ticketStatusController.toggleTicketStatus
);

module.exports = router;