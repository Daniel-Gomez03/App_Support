const User = require('../models/User');
const permissionsController = require('./permissionsController');
const Permissions = require('../models/Permission');

// ============================================
// OBTENER TODOS LOS USUARIOS
// ============================================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{
                model: Permissions,
                as: 'Permissions',
                include: ['Seccion']
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        console.error("Error en getAllUsers:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER USUARIO POR ID
// ============================================
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            include: [{
                model: Permissions,
                as: 'Permissions',
                include: ['Seccion']
            }]
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error("Error en getUserById:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR USUARIO 
// ============================================
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol, cargo, area, permisos } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        await user.update({
            rol: rol !== undefined ? rol : user.rol,
            cargo: cargo !== undefined ? cargo : user.cargo,
            area: area !== undefined ? area : user.area
        });

        if (permisos && Array.isArray(permisos)) {
            await permissionsController.saveUserPermissions(id, permisos, req);
        }

        const updatedUser = await User.findByPk(id, {
            include: [{ model: Permissions, as: 'Permissions' }]
        });

        const io = req.app.get('io');
        if (io) io.emit('user_updated', updatedUser);

        res.json({
            message: 'Usuario y permisos actualizados con éxito',
            user: updatedUser
        });
    } catch (error) {
        console.error("Error en updateUser:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR USUARIO
// ============================================
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        await user.destroy();

        const io = req.app.get('io');
        if (io) io.emit('user_deleted', id);

        res.json({ message: 'Usuario eliminado permanentemente del sistema' });
    } catch (error) {
        console.error("Error en deleteUser:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CAMBIAR ESTADO 
// ============================================
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const nuevoEstado = user.estado === 1 ? 0 : 1;
        await user.update({ estado: nuevoEstado });

        const io = req.app.get('io');
        if (io) {
            io.emit('user_status_toggled', { user_id: user.user_id, new_status: nuevoEstado });

            if (nuevoEstado === 0) {
                io.to(id.toString()).emit('force_logout', {
                    message: 'Tu cuenta ha sido desactivada por un administrador.'
                });
                console.log(`Socket: Usuario ${id} expulsado del sistema.`);
            }
        }

        res.json({
            message: `Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'} correctamente`,
            estado: nuevoEstado
        });
    } catch (error) {
        console.error("Error en toggleUserStatus:", error);
        res.status(500).json({ error: error.message });
    }
};