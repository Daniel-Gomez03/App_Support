// ============================================
// CONTROLADOR DE PERMISOS
// Gestiona los permisos granulares de acceso
// por módulo para cada usuario del panel admin.
// Cada permiso define tres niveles independientes:
// lectura, escritura y edición.
// saveUserPermissions es una función auxiliar
// invocada por otros controladores (no es una
// ruta Express directa) y usa upsert en paralelo
// para insertar o actualizar en una sola operación.
// ============================================

const Permission = require('../models/Permission');
const Seccion = require('../models/Seccion');

// ============================================
// OBTENER PERMISOS DE UN USUARIO
// Devuelve todos los permisos del usuario con
// el nombre del módulo incluido, ordenados por
// módulo para una presentación consistente en
// la vista de configuración de accesos.
// ============================================
exports.getUserPermissions = async (req, res) => {
    const { id } = req.params;
    try {
        const permisos = await Permission.findAll({
            where: { user_id: id },
            include: [{
                model: Seccion,
                as: 'seccion',
                attributes: ['module_name'],
            }],
            order: [['module_id', 'ASC']],
        });

        res.json(permisos);
    } catch (error) {
        console.error('Error al obtener permisos del usuario:', error);
        res.status(500).json({ message: 'Error al obtener permisos' });
    }
};

// ============================================
// GUARDAR O ACTUALIZAR PERMISOS (Helper)
// Función auxiliar llamada desde userController
// al crear o editar un usuario. Recibe el array
// de permisos y ejecuta un upsert por cada
// módulo en paralelo con Promise.all.
// Al completar emite 'permisos_actualizados'
// a la sala privada del usuario afectado para
// que su sesión activa recargue sus permisos
// sin necesidad de cerrar sesión.
// ============================================
exports.saveUserPermissions = async (user_id, permissionsArray, req) => {
    try {
        await Promise.all(
            permissionsArray.map(perm =>
                Permission.upsert({
                    user_id,
                    module_id: perm.module_id,
                    permissions_read: perm.permissions_read ? 1 : 0,
                    permissions_write: perm.permissions_write ? 1 : 0,
                    permissions_edit: perm.permissions_edit ? 1 : 0,
                })
            )
        );

        const io = req.app.get('io');
        if (io) io.to(user_id.toString()).emit('permisos_actualizados');

        return { success: true };
    } catch (error) {
        console.error('Error al guardar permisos:', error);
        throw error;
    }
};