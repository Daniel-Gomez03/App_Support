// ============================================
// MIDDLEWARE DE AUTENTICACIÓN MÓVIL
// Protege las rutas consumidas por la app
// móvil de clientes. En lugar de JWT usa el
// customer_id como Bearer token en el header
// Authorization, ya que la autenticación móvil
// se basa en identificación directa por ID.
// Verifica que el cliente exista y esté activo
// antes de adjuntarlo a req.customer.
// ============================================

const Customer = require('../models/Customer');

// ============================================
// MOBILE AUTH
// Extrae el customer_id del header Authorization
// con formato "Bearer <id>". Valida que sea un
// número, que el cliente exista en BD y que
// su estado sea activo (customer_status = 1).
// Adjunta el registro completo a req.customer
// para uso en los controladores móviles.
// ============================================
const mobileAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acceso no autorizado. Se requiere token.' });
        }

        const customerId = authHeader.split(' ')[1];

        if (!customerId || isNaN(Number(customerId))) {
            return res.status(401).json({ error: 'Token inválido.' });
        }

        const customer = await Customer.findByPk(Number(customerId));

        if (!customer) {
            return res.status(401).json({ error: 'Cliente no encontrado.' });
        }

        if (customer.customer_status !== 1) {
            return res.status(403).json({ error: 'Cuenta inactiva o pendiente de revisión.' });
        }

        req.customer = customer;
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Error de autenticación.' });
    }
};

module.exports = mobileAuth;