const express = require('express');
const router = express.Router();
const ticketController = require('../Controllers/ticketController');
const { upload } = require('../Middleware/ticketUpload');
const authorize = require('../Middleware/authorize');

router.get('/tickets',  
    authorize('Crear Ticket', 'permissions_read'), 
    ticketController.getAllTickets
);

router.get('/tickets/:id',  
    authorize('Crear Ticket', 'permissions_read'), 
    ticketController.getTicketById
);

router.post('/tickets',  
    authorize('Crear Ticket', 'permissions_write'), 
    upload.array('evidences', 5), 
    ticketController.createTicketAdmin
);

router.put('/tickets/:id',  
    authorize('Crear Ticket', 'permissions_edit'), 
    ticketController.updateTicket
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