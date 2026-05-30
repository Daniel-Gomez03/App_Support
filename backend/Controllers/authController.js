// ============================================
// CONTROLADOR DE AUTENTICACIÓN (PORTAL SSO)
// Gestiona el inicio de sesión desde el portal
// de aplicativos, la obtención del usuario activo
// y el cierre de sesión. La autenticación es
// SSO: el portal envía los datos del usuario y
// este módulo emite/invalida el JWT en cookie.
// ============================================

const User = require('../models/User');
const Permission = require('../models/Permission');
const Seccion = require('../models/Seccion');
const jwt = require('jsonwebtoken');

// ============================================
// HELPER — FECHA LOCAL EN FORMATO YYYY-MM-DD
// Usa métodos locales del objeto Date para
// respetar la zona horaria del servidor y que
// el cálculo de racha diaria sea correcto.
// ============================================
const toLocalDateStr = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ============================================
// LOGIN DESDE PORTAL CORPORATIVO
// Recibe los datos del usuario autenticado en
// el portal SSO. Si el usuario no existe en la
// BD lo crea con permiso de lectura en Dashboard
// (module_id = 1). Si ya existe, actualiza su
// foto, nombre y calcula la racha de conexión.
// Emite un JWT en cookie httpOnly (12 h) y
// redirige al frontend.
// ============================================
const portalLogin = async (req, res) => {
    try {
        const { user_id, nombre, apellido, correo, foto } = req.body;

        if (!user_id || !correo) {
            return res.status(400).json({ message: 'Datos incompletos desde el portal.' });
        }

        const nombre_completo = `${nombre} ${apellido}`.trim();
        const ahora = new Date();
        const hoyStr = toLocalDateStr(ahora);
        const ayer = new Date(ahora);
        ayer.setDate(ayer.getDate() - 1);
        const ayerStr = toLocalDateStr(ayer);

        // findOrCreate: busca por PK o crea el registro en una sola operación
        const [user, created] = await User.findOrCreate({
            where: { user_id },
            defaults: {
                nombre_completo,
                correo,
                foto: foto || 'default.jpg',
                fecha_ingreso_soporte: ahora,
                estado: 1,
                racha_actual: 0,
                racha_perdida: 0,
                ultima_conexion: ahora,
            },
        });

        if (created) {
            // Asignar permiso de lectura en Dashboard al nuevo usuario
            await Permission.create({
                user_id: user.user_id,
                module_id: 1,
                permissions_read: 1,
                permissions_write: 0,
                permissions_edit: 0,
            });
        } else {
            // Verificar que la cuenta esté activa
            if (user.estado === 0) {
                return res.status(403).send(`
                    <script>
                        alert("Tu cuenta en Soporte ha sido deshabilitada. Contacta al administrador.");
                        window.location.href = "http://localhost/PortalAplicativos/public/inicio";
                    </script>
                `);
            }

            // Calcular racha de conexión diaria
            let nuevaRacha = user.racha_actual || 0;
            let rachaPerdida = user.racha_perdida || 0;

            if (user.ultima_conexion) {
                const ultimaStr = toLocalDateStr(user.ultima_conexion);
                if (ultimaStr === ayerStr) {
                    nuevaRacha += 1;                    // Conexión consecutiva
                } else if (ultimaStr !== hoyStr) {
                    rachaPerdida = user.racha_actual;   // Racha rota
                    nuevaRacha = 0;
                }
                // Si ultimaStr === hoyStr: ya inició sesión hoy, no cambia nada
            }

            await user.update({
                nombre_completo,
                foto: foto || user.foto,
                racha_actual: nuevaRacha,
                racha_perdida: rachaPerdida,
                ultima_conexion: ahora,
            });
        }

        // Emitir JWT en cookie httpOnly
        const token = jwt.sign(
            { user_id: user.user_id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000,
        });

        res.redirect('http://localhost:5173/');

    } catch (error) {
        console.error('Error en portalLogin:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// ============================================
// OBTENER USUARIO ACTIVO (GET /api/me)
// Verifica que el token sea válido y que la
// cuenta esté activa. Retorna el usuario con
// sus permisos y módulos asociados para que
// el frontend controle el acceso por sección.
// ============================================
const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            include: [{
                model: Permission,
                as: 'Permissions',
                include: [{
                    model: Seccion,
                    as: 'Seccion',
                }],
            }],
        });

        if (!user || user.estado === 0) {
            res.clearCookie('token');
            return res.status(403).json({ message: 'Usuario deshabilitado o no encontrado.' });
        }

        res.json({ status: 'success', user });

    } catch (error) {
        console.error('Error en getMe:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// ============================================
// CIERRE DE SESIÓN (POST /api/logout)
// Invalida la sesión eliminando la cookie JWT.
// ============================================
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ status: 'success', message: 'Sesión cerrada exitosamente.' });
};

module.exports = { portalLogin, getMe, logout };