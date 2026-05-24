// ============================================
// CONTROLADOR DE USUARIOS
// Gestiona los técnicos y administradores del
// panel de soporte. Incluye actualización de
// rol/cargo/área con permisos granulares,
// eliminación física y cambio de estado.
// Al desactivar una cuenta se emite force_logout
// a la sala privada del usuario para expulsarlo
// de la sesión activa en tiempo real.
// ============================================

const User = require('../models/User');
const Permissions = require('../models/Permission');
const Seccion = require('../models/Seccion');
const permissionsController = require('./permissionsController');

// ============================================
// INCLUDE ESTÁNDAR CON PERMISOS
// Carga los permisos del usuario junto con el
// nombre de cada módulo (Seccion). Reutilizado
// en getAllUsers, getUserById y updateUser.
// ============================================
const USER_INCLUDE = [{
    model: Permissions,
    as: 'Permissions',
    include: [{
        model: Seccion,
        as: 'Seccion',
    }],
}];

// ============================================
// OBTENER TODOS LOS USUARIOS
// Devuelve técnicos y admins con sus permisos
// y módulos asociados, ordenados por fecha de
// creación DESC.
// ============================================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: USER_INCLUDE,
            order: [['created_at', 'DESC']],
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
        const user = await User.findByPk(id, { include: USER_INCLUDE });

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        console.error("Error en getUserById:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR USUARIO
// Actualiza rol, cargo y área usando ?? para
// conservar el valor actual en campos no
// enviados. Si se incluye el array de permisos,
// delega en saveUserPermissions (helper) que
// ejecuta upsert en paralelo por cada módulo
// y notifica al usuario en tiempo real.
// Emite 'user_updated' al finalizar.
// ============================================
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol, cargo, area, permisos } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        await user.update({
            rol: rol ?? user.rol,
            cargo: cargo ?? user.cargo,
            area: area ?? user.area,
        });

        if (permisos && Array.isArray(permisos)) {
            await permissionsController.saveUserPermissions(id, permisos, req);
        }

        const updatedUser = await User.findByPk(id, { include: USER_INCLUDE });

        const io = req.app.get('io');
        if (io) io.emit('user_updated', updatedUser);

        res.json({ message: 'Usuario y permisos actualizados con éxito', user: updatedUser });
    } catch (error) {
        console.error("Error en updateUser:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR USUARIO
// Eliminación física. Emite 'user_deleted'
// con el ID para que el panel retire la fila
// sin recargar la lista completa.
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
// CAMBIAR ESTADO DE USUARIO (toggle)
// Activo ↔ Inactivo. Cuando se desactiva una
// cuenta activa, emite 'force_logout' a la sala
// privada del usuario (io.to(id)) para que el
// frontend cierre la sesión inmediatamente sin
// esperar a que expire el JWT.
// Emite 'user_status_toggled' globalmente para
// actualizar la vista de usuarios en el panel.
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
                    message: 'Tu cuenta ha sido desactivada por un administrador.',
                });
            }
        }

        res.json({
            message: `Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'} correctamente`,
            estado: nuevoEstado,
        });
    } catch (error) {
        console.error("Error en toggleUserStatus:", error);
        res.status(500).json({ error: error.message });
    }
};