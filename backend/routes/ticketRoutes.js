const express = require('express');
const router = express.Router();
const ticketController = require('../Controllers/ticketController');
const { upload } = require('../Middleware/ticketUpload');
const authorize = require('../Middleware/authorize');

router.get('/tickets',
    authorize('Asignar Tickets', 'permissions_read'),
    ticketController.getAllTickets
);

router.get('/tickets/unassigned',
    authorize('Asignar Tickets', 'permissions_read'),
    ticketController.getUnassignedTicketCount
);

router.get('/tickets/active/count',
    authorize('Tickets Activos', 'permissions_read'),
    ticketController.getActiveTicketCount
);

router.get('/tickets/active/list',
    authorize('Tickets Activos', 'permissions_read'),
    ticketController.getActiveTickets
);

router.get('/tickets/:id',
    authorize('Asignar Tickets', 'permissions_read'),
    ticketController.getTicketById
);

router.post('/tickets',
    authorize('Crear Ticket', 'permissions_write'),
    upload.array('evidences', 5),
    ticketController.createTicketAdmin
);

router.put('/tickets/:id',
    authorize('Asignar Tickets', 'permissions_edit'),
    ticketController.updateTicket
);

router.put('/tickets/:id/assign',
    authorize('Asignar Tickets', 'permissions_edit'),
    ticketController.assignTicket
);

router.patch('/tickets/:id/status',
    authorize('Tickets Activos', 'permissions_edit'),
    ticketController.updateTicketStatus
);

router.patch('/tickets/:id/pause',
    authorize('Tickets Activos', 'permissions_edit'),
    ticketController.toggleChatPause
);

router.patch('/tickets/toggle/:id',
    authorize('Crear Ticket', 'permissions_edit'),
    ticketController.toggleTicketActive
);

router.delete('/tickets/:id',
    authorize('Crear Ticket', 'permissions_delete'),
    ticketController.deleteTicket
);

module.exports = router;