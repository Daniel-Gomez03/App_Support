// ============================================
// RUTAS: USUARIOS DEL PANEL
// Gestión de los técnicos y supervisores del
// panel web. No incluye POST porque los usuarios
// se crean externamente desde el portal de
// aplicativos y se sincronizan en el primer
// login; aquí solo se administran.
//
// GET    /users                    → getAllUsers        (read)
// GET    /users/:id                → getUserById       (read)
// PUT    /users/:id                → updateUser        (edit)
// DELETE /users/:id                → deleteUser        (edit)
// PATCH  /users/:id/toggle-status  → toggleUserStatus  (edit)
// ============================================

const express = require('express');
const router = express.Router();
const usersController = require('../Controllers/userController');
const authorize = require('../Middleware/authorize');

router.get('/users',
    authorize('Usuarios', 'permissions_read'),
    usersController.getAllUsers
);

router.get('/users/:id',
    authorize('Usuarios', 'permissions_read'),
    usersController.getUserById
);

router.put('/users/:id',
    authorize('Usuarios', 'permissions_edit'),
    usersController.updateUser
);

router.delete('/users/:id',
    authorize('Usuarios', 'permissions_edit'),
    usersController.deleteUser
);

router.patch('/users/:id/toggle-status',
    authorize('Usuarios', 'permissions_edit'),
    usersController.toggleUserStatus
);

module.exports = router;