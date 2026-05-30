// ============================================
// RUTAS: COMENTARIOS DE TICKET (CHAT INTERNO)
// Gestiona los mensajes del chat de un ticket
// entre técnicos y el cliente. El POST admite
// hasta 5 archivos adjuntos procesados por
// ticketUpload antes de llegar al controlador.
//
// GET    /tickets/:id/comments                          → getComments  (read)
// POST   /tickets/:id/comments                          → addComment   (write) + upload
// DELETE /tickets/:ticketId/comments/:commentId         → deleteComment (delete)
// ============================================

const express = require('express');
const router = express.Router();
const commentController = require('../Controllers/commentController');
const { upload } = require('../Middleware/ticketUpload');
const authorize = require('../Middleware/authorize');

router.get('/tickets/:id/comments',
    authorize('Tickets Activos', 'permissions_read'),
    commentController.getComments
);

router.post('/tickets/:id/comments',
    authorize('Tickets Activos', 'permissions_write'),
    upload.array('attachments', 5),
    commentController.addComment
);

router.delete('/tickets/:ticketId/comments/:commentId',
    authorize('Tickets Activos', 'permissions_delete'),
    commentController.deleteComment
);

module.exports = router;