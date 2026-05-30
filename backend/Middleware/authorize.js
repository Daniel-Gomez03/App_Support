// ============================================
// MIDDLEWARE DE AUTORIZACIÓN GRANULAR
// Verifica que el usuario autenticado tenga
// el permiso específico requerido sobre el
// módulo indicado antes de ejecutar el
// controlador. Se aplica después de
// verificarToken, que ya adjuntó req.user.
//
// Uso: authorize('Tickets', 'can_write')
// Tipos de permiso: can_read, can_write, can_edit
// ============================================

const Permission = require('../models/Permission');
const Seccion = require('../models/Seccion');

// ============================================
// AUTHORIZE (moduleName, permissionType)
// Factoría que devuelve un middleware Express.
// Primero resuelve el module_id a partir del
// nombre del módulo (debe estar activo).
// Luego busca el registro de permisos del
// usuario y comprueba que el campo indicado
// sea 1. Dos consultas secuenciales porque la
// segunda depende del module_id de la primera.
// ============================================
const authorize = (moduleName, permissionType) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.user_id;

            const seccion = await Seccion.findOne({
                where: { module_name: moduleName, module_status: 1 },
            });

            if (!seccion) {
                return res.status(404).json({ message: 'Módulo no encontrado o inactivo.' });
            }

            const permission = await Permission.findOne({
                where: {
                    user_id: userId,
                    module_id: seccion.module_id,
                },
            });

            if (!permission || permission[permissionType] !== 1) {
                return res.status(403).json({
                    message: `No tienes permisos de ${permissionType.split('_')[1]} en el módulo ${moduleName}.`,
                });
            }

            next();
        } catch (error) {
            console.error('Error en el middleware de autorización:', error);
            res.status(500).json({ message: 'Error interno al verificar permisos.' });
        }
    };
};

module.exports = authorize;