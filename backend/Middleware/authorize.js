const Permission = require('../models/Permission');
const Seccion = require('../models/Seccion');

const authorize = (moduleName, permissionType) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.user_id;

            const seccion = await Seccion.findOne({
                where: { module_name: moduleName, module_status: 1 }
            });

            if (!seccion) {
                return res.status(404).json({ message: 'Módulo no encontrado o inactivo.' });
            }

            const permission = await Permission.findOne({
                where: {
                    user_id: userId,
                    module_id: seccion.module_id
                }
            });

            if (!permission || permission[permissionType] !== 1) {
                return res.status(403).json({
                    message: `No tienes permisos de ${permissionType.split('_')[1]} en el módulo ${moduleName}.`
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