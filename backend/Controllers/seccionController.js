// ============================================
// CONTROLADOR DE SECCIONES (MÓDULOS)
// Gestiona el catálogo de módulos del sistema
// que controlan el acceso granular por usuario.
// Cada sección activa puede tener permisos de
// lectura, escritura y edición asignados de
// forma independiente por usuario en la tabla
// permissions.
// ============================================

const Seccion = require('../models/Seccion');

// ============================================
// OBTENER TODOS LOS MÓDULOS ACTIVOS
// Devuelve únicamente los módulos con
// module_status = 1, ordenados por ID para que
// el panel de permisos los muestre siempre en
// el mismo orden. Responde 404 si no hay
// módulos configurados, ya que una lista vacía
// indica un problema en la configuración de
// la base de datos.
// ============================================
exports.getAllSecciones = async (req, res) => {
    try {
        const secciones = await Seccion.findAll({
            where: { module_status: 1 },
            order: [['module_id', 'ASC']],
        });

        if (!secciones || secciones.length === 0) {
            return res.status(404).json({ message: 'No se encontraron secciones configuradas.' });
        }

        res.json(secciones);
    } catch (error) {
        console.error('Error al obtener secciones:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener las secciones',
            error: error.message,
        });
    }
};