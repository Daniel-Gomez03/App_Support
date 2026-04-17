const express = require('express');
const router = express.Router();
const seccionController = require('../Controllers/seccionController');
const authorize = require('../Middleware/authorize');

router.get('/secciones', 
    authorize('Usuarios', 'permissions_read'), 
    seccionController.getAllSecciones
);

module.exports = router;