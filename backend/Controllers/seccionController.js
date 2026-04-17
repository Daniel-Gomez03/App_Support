const Seccion = require('../models/Seccion');

// ============================================
// OBTENER TODOS LOS MODULOS
// ============================================
exports.getAllSecciones = async (req, res) => {
    try {
        const secciones = await Seccion.findAll({
            where: { module_status: 1 },
            order: [['module_id', 'ASC']]
        });

        if (!secciones || secciones.length === 0) {
            return res.status(404).json({ message: 'No se encontraron secciones configuradas.' });
        }

        res.json(secciones);
    } catch (error) {
        console.error('Error al obtener secciones:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener las secciones',
            error: error.message
        });
    }
};