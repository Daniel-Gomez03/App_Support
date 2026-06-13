// ============================================
// RUTAS: TICKETS (PANEL WEB)
// Gestiona el ciclo de vida completo de los
// tickets desde el panel. Los permisos están
// distribuidos entre tres módulos según el
// rol en el flujo: 'Crear Ticket' para alta
// y baja, 'Asignar Tickets' para asignación
// y edición general, y 'Tickets Activos' para
// el seguimiento y cambio de estado.
//
// GET    /tickets                   → getAllTickets           (Asignar Tickets - read)
// GET    /tickets/unassigned        → getUnassignedTicketCount (Asignar Tickets - read)
// GET    /tickets/active/count      → getActiveTicketCount    (Tickets Activos - read)
// GET    /tickets/active/list       → getActiveTickets        (Tickets Activos - read)
// GET    /tickets/:id               → getTicketById           (Asignar Tickets - read)
// POST   /tickets                   → createTicketAdmin       (Crear Ticket - write) + upload
// PUT    /tickets/:id               → updateTicket            (Asignar Tickets - edit)
// PUT    /tickets/:id/assign        → assignTicket            (Asignar Tickets - edit)
// PATCH  /tickets/:id/status        → updateTicketStatus      (Tickets Activos - edit)
// PATCH  /tickets/:id/pause         → toggleChatPause         (Tickets Activos - edit)
// PATCH  /tickets/toggle/:id        → toggleTicketActive      (Crear Ticket - edit)
// DELETE /tickets/:id               → deleteTicket            (Crear Ticket - delete)
// ============================================

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