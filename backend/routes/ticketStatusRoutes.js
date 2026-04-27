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