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