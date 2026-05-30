// ============================================
// MIDDLEWARE DE AUTENTICACIÓN (PANEL WEB)
// Verifica el JWT almacenado en la cookie
// httpOnly 'token' antes de permitir el acceso
// a cualquier ruta protegida del panel admin.
// Rechaza la petición si el token falta, expiró
// o es inválido, si el usuario fue eliminado de
// la BD, o si su cuenta fue desactivada.
// En todos los casos de rechazo limpia la cookie
// para forzar un nuevo login.
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// VERIFICAR TOKEN
// Lee el JWT de req.cookies.token, lo valida
// con JWT_SECRET y comprueba que el usuario
// siga existiendo y activo en la base de datos.
// Adjunta el registro completo del usuario a
// req.user para que los controladores lo usen
// sin volver a consultar la BD.
// ============================================
const verificarToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Acceso denegado. No hay sesión activa.',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.user_id);

        if (!user) {
            res.clearCookie('token');
            return res.status(401).json({
                status: 'error',
                message: 'El usuario ya no existe en el sistema.',
            });
        }

        if (user.estado === 0) {
            res.clearCookie('token');
            return res.status(403).json({
                status: 'error',
                message: 'Tu cuenta ha sido desactivada. Contacta al administrador.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.clearCookie('token');
        const message = error.name === 'TokenExpiredError' ? 'Sesión expirada.' : 'Token inválido.';
        return res.status(401).json({
            status: 'error',
            message,
        });
    }
};

module.exports = { verificarToken };