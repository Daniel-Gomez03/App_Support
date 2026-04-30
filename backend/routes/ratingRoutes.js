const express = require('express');
const router = express.Router();
const ratingController = require('../Controllers/ratingController');
const authorize = require('../Middleware/authorize');

router.get('/ratings',
    authorize('Comentarios', 'permissions_read'),
    ratingController.getRatings
);

module.exports = router;