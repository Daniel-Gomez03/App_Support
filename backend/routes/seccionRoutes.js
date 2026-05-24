// ============================================
// RUTAS: SECCIONES (módulos del panel)
// Expone el catálogo de módulos disponibles
// en el panel. Se consume principalmente en
// la pantalla de gestión de permisos para
// construir la matriz usuario-módulo.
// Solo lectura; los módulos son datos de
// configuración que se gestionan directamente
// en la BD.
//
// GET /secciones → getAllSecciones (read)
// ============================================

const express = require('express');
const router = express.Router();
const seccionController = require('../Controllers/seccionController');
const authorize = require('../Middleware/authorize');

router.get('/secciones',
    authorize('Usuarios', 'permissions_read'),
    seccionController.getAllSecciones
);

module.exports = router;