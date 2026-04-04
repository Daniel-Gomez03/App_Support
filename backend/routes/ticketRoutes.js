const express = require('express');
const router = express.Router();
const ticketController = require('../Controllers/ticketController');
const { upload } = require('../Middleware/ticketUpload');

router.get('/tickets', ticketController.getAllTickets);
router.get('/tickets/:id', ticketController.getTicketById);
router.get('/tickets/customer/:id', ticketController.getTicketsByCustomer);
router.get('/tickets/active/:id', ticketController.getTicketsActivosByCustomer);

router.post('/tickets', upload.array('evidences', 5), ticketController.createTicket);
router.put('/tickets/:id', ticketController.updateTicket);
router.patch('/tickets/toggle/:id', ticketController.toggleTicketActive);
router.delete('/tickets/:id', ticketController.deleteTicket);

module.exports = router;