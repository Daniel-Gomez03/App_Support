const User = require('../models/User');
const Permission = require('../models/Permission');
const Seccion = require('../models/Seccion');
const jwt = require('jsonwebtoken');

const obtenerFechaLocalStr = (fecha) => {
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const portalLogin = async (req, res) => {
    try {
        const { user_id, nombre, apellido, correo, foto } = req.body;

        if (!user_id || !correo) {
            return res.status(400).json({ message: "Datos incompletos desde el portal" });
        }

        const nombre_completo = `${nombre} ${apellido}`.trim();
        const ahora = new Date();
        const hoyStr = obtenerFechaLocalStr(ahora);
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const ayerStr = obtenerFechaLocalStr(ayer);

        let user = await User.findByPk(user_id);

        if (!user) {
            user = await User.create({
                user_id: user_id,
                nombre_completo: nombre_completo,
                correo: correo,
                foto: foto || 'default.jpg',
                fecha_ingreso_soporte: ahora,
                estado: 1,
                racha_actual: 0,
                racha_perdida: 0,
                ultima_conexion: ahora
            });

            await Permission.create({
                user_id: user.user_id,
                module_id: 1,
                permissions_read: 1,
                permissions_write: 0,
                permissions_edit: 0
            });
        } else {
            if (user.estado === 0) {
                return res.status(403).send(`
                    <script>
                        alert("Tu cuenta en Soporte ha sido deshabilitada. Contacta al administrador.");
                        window.location.href = "http://localhost/PortalAplicativos/public/inicio";
                    </script>
                `);
            }

            let nuevaRacha = user.racha_actual || 0;
            let rachaPerdidaActualizada = user.racha_perdida || 0;

            if (user.ultima_conexion) {
                const ultimaStr = obtenerFechaLocalStr(user.ultima_conexion);
                if (ultimaStr === ayerStr) {
                    nuevaRacha += 1;
                } else if (ultimaStr !== hoyStr) {
                    rachaPerdidaActualizada = user.racha_actual;
                    nuevaRacha = 0;
                }
            }

            await user.update({
                nombre_completo: nombre_completo,
                foto: foto || user.foto,
                racha_actual: nuevaRacha,
                racha_perdida: rachaPerdidaActualizada,
                ultima_conexion: ahora
            });
        }

        const token = jwt.sign(
            { user_id: user.user_id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000
        });

        res.redirect(`http://localhost:5173/`);

    } catch (error) {
        console.error("Error en Auth:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            include: [{
                model: Permission,
                as: 'Permissions',
                include: [{
                    model: Seccion,
                    as: 'Seccion'
                }]
            }]
        });

        if (!user || user.estado === 0) {
            res.clearCookie('token');
            return res.status(403).json({ message: "Usuario deshabilitado o no encontrado" });
        }

        res.json({ status: 'success', user });
    } catch (error) {
        console.error("Error en getMe:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ status: 'success', message: 'Sesión cerrada exitosamente' });
};

module.exports = { portalLogin, getMe, logout };