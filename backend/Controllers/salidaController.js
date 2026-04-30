const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const Salida = require('../models/Salida');

// ============================================
// OBTENER TODAS LAS SALIDAS
// ============================================
exports.getAllSalidas = async (req, res) => {
    try {
        const salidas = await sequelize.query(`
            SELECT
                s.salida_id,
                s.salida_destination,
                s.salida_date,
                s.salida_time,
                s.salida_status,
                s.rejection_reason,
                s.created_at,
                s.ticket_id,
                t.ticket_subject,
                c.customer_company,
                s.user_id,
                u.nombre_completo,
                u.rol,
                u.cargo,
                u.foto,
                au.nombre_completo AS approved_by_name
            FROM salidas s
            JOIN tickets   t  ON s.ticket_id   = t.ticket_id
            JOIN customers c  ON t.customer_id = c.customer_id
            JOIN users     u  ON s.user_id     = u.user_id
            LEFT JOIN users au ON s.approved_by = au.user_id
            ORDER BY s.created_at DESC
        `, { type: QueryTypes.SELECT });

        res.json(salidas);
    } catch (error) {
        console.error('getAllSalidas error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// TICKETS ACTIVOS ASIGNADOS A UN USUARIO
// ============================================
exports.getTicketsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const tickets = await sequelize.query(`
            SELECT
                t.ticket_id,
                t.ticket_subject,
                c.customer_company
            FROM tickets t
            JOIN ticket_assignments ta ON t.ticket_id  = ta.ticket_id
            JOIN customers         c  ON t.customer_id = c.customer_id
            WHERE ta.user_id          = :userId
              AND t.ticket_status_id NOT IN (9, 10)
              AND t.ticket_status     = 1
            ORDER BY t.created_at DESC
        `, { replacements: { userId }, type: QueryTypes.SELECT });

        res.json(tickets);
    } catch (error) {
        console.error('getTicketsByUser error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR SALIDA
// ============================================
exports.createSalida = async (req, res) => {
    try {
        const { ticket_id, user_id, salida_destination, salida_date, salida_time } = req.body;

        if (!ticket_id || !user_id || !salida_destination || !salida_date || !salida_time) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        const salida = await Salida.create({
            ticket_id,
            user_id,
            salida_destination,
            salida_date,
            salida_time,
            salida_status: 0,
        });

        const io = req.app.get('io');
        io.emit('salida_created', { salidaId: salida.salida_id });

        res.status(201).json(salida);
    } catch (error) {
        console.error('createSalida error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// APROBAR O RECHAZAR SALIDA
// ============================================
exports.updateSalidaStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { salida_status, rejection_reason } = req.body;
        const approved_by = req.user.user_id;

        const salida = await Salida.findByPk(id);
        if (!salida) return res.status(404).json({ message: 'Salida no encontrada.' });
        if (salida.salida_status !== 0) {
            return res.status(400).json({ message: 'Esta salida ya fue procesada.' });
        }

        await salida.update({
            salida_status,
            rejection_reason: rejection_reason || null,
            approved_by,
        });

        const io = req.app.get('io');
        io.emit('salida_status_updated', { salidaId: salida.salida_id, status: salida_status });

        res.json(salida);
    } catch (error) {
        console.error('updateSalidaStatus error:', error);
        res.status(500).json({ error: error.message });
    }
};