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