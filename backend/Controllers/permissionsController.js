const Permission = require('../models/Permission');
const Seccion = require('../models/Seccion');

// ============================================
// OBTENER PERMISOS DE UN USUARIO ESPECÍFICO
// ============================================
exports.getUserPermissions = async (req, res) => {
    const { id } = req.params;
    try {
        const permisos = await Permission.findAll({
            where: { user_id: id },
            include: [{
                model: Seccion,
                as: 'seccion',
                attributes: ['module_name']
            }]
        });

        res.json(permisos);
    } catch (error) {
        console.error('Error al obtener permisos del usuario:', error);
        res.status(500).json({ message: 'Error al obtener permisos' });
    }
};

// ============================================
// GUARDAR O ACTUALIZAR PERMISOS 
// ============================================
exports.saveUserPermissions = async (user_id, permissionsArray, req) => {
    try {
        const savePromises = permissionsArray.map(perm => {
            return Permission.upsert({
                user_id: user_id,
                module_id: perm.module_id,
                permissions_read: perm.permissions_read ? 1 : 0,
                permissions_write: perm.permissions_write ? 1 : 0,
                permissions_edit: perm.permissions_edit ? 1 : 0
            });
        });

        await Promise.all(savePromises);


        const io = req.app.get('io');

        if (io) {
            io.to(user_id.toString()).emit('permisos_actualizados');
            console.log(`Socket emitido silenciosamente al usuario: ${user_id}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error al guardar permisos:', error);
        throw error; 
    }
};