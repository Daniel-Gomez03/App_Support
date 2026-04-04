const express = require('express');
const router = express.Router();
const ticketStatusController = require('../Controllers/ticketStatusController');

router.get('/ticket-statuses', ticketStatusController.getAllTicketStatuses);
router.get('/ticket-statuses/inactives', ticketStatusController.getAllTicketStatusesInactives);

router.post('/ticket-statuses', ticketStatusController.createTicketStatus);
router.put('/ticket-statuses/:id', ticketStatusController.updateTicketStatus);
router.delete('/ticket-statuses/:id', ticketStatusController.deleteTicketStatus);
router.patch('/ticket-statuses/toggle/:id', ticketStatusController.toggleTicketStatus);

module.exports = router;