const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verificarToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Acceso denegado. No hay sesión activa.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.user_id);

        if (!user) {
            res.clearCookie('token'); 
            return res.status(401).json({
                status: 'error',
                message: 'El usuario ya no existe en el sistema.'
            });
        }

        if (user.estado === 0) {
            res.clearCookie('token'); 
            return res.status(403).json({
                status: 'error',
                message: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
            });
        }
        
        req.user = user; 
        next();

    } catch (error) {
        res.clearCookie('token');
        const message = error.name === 'TokenExpiredError' ? 'Sesión expirada.' : 'Token inválido.';
        return res.status(401).json({
            status: 'error',
            message: message
        });
    }
};

module.exports = { verificarToken };