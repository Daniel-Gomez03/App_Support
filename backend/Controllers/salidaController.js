// ============================================
// CONTROLADOR DE SALIDAS
// Gestiona las solicitudes de desplazamiento de
// campo realizadas por los técnicos. Cada salida
// está vinculada a un ticket activo y requiere
// aprobación o rechazo por parte del Admin.
// ============================================

const { Op } = require('sequelize');
const Salida = require('../models/Salida');
const Ticket = require('../models/Ticket');
const Customer = require('../models/Customer');
const User = require('../models/User');

// ============================================
// OBTENER TODAS LAS SALIDAS
// Devuelve cada solicitud con el ticket y su
// empresa cliente anidados, el técnico solicitante
// y el usuario que la aprobó o rechazó (nullable).
// Ordenado por fecha de creación DESC.
// ============================================
exports.getAllSalidas = async (req, res) => {
    try {
        const salidas = await Salida.findAll({
            include: [
                {
                    model: Ticket,
                    as: 'ticket',
                    attributes: ['ticket_id', 'ticket_subject'],
                    include: [{
                        model: Customer,
                        as: 'customer',
                        attributes: ['customer_company'],
                    }],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'nombre_completo', 'rol', 'cargo', 'foto'],
                },
                {
                    model: User,
                    as: 'approvedBy',
                    attributes: ['user_id', 'nombre_completo'],
                    required: false,
                },
            ],
            order: [['created_at', 'DESC']],
        });

        res.json(salidas);
    } catch (error) {
        console.error('getAllSalidas error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// TICKETS ACTIVOS ASIGNADOS A UN USUARIO
// Devuelve los tickets en curso (estados 1-8)
// asignados al técnico indicado, con la empresa
// del cliente para mostrarla en el formulario
// de creación de salida.
// ============================================
exports.getTicketsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const tickets = await Ticket.findAll({
            attributes: ['ticket_id', 'ticket_subject'],
            where: {
                ticket_status: 1,
                ticket_status_id: { [Op.notIn]: [9, 10] },
            },
            include: [
                {
                    model: User,
                    as: 'assignedUsers',
                    where: { user_id: userId },
                    attributes: [],
                    through: { attributes: [] },
                    required: true,
                },
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['customer_company'],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        res.json(tickets);
    } catch (error) {
        console.error('getTicketsByUser error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR SALIDA
// Registra la solicitud con estado 0 (Pendiente).
// Emite 'salida_created' para que el panel Admin
// muestre la nueva solicitud en tiempo real.
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
        if (io) io.emit('salida_created', { salidaId: salida.salida_id });

        res.status(201).json(salida);
    } catch (error) {
        console.error('createSalida error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// APROBAR O RECHAZAR SALIDA
// Solo se pueden procesar solicitudes en estado 0
// (Pendiente). Registra el usuario que resolvió
// la solicitud en el campo approved_by.
// Emite 'salida_status_updated' con el nuevo
// estado para sincronizar el panel en tiempo real.
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
        if (io) io.emit('salida_status_updated', {
            salidaId: salida.salida_id,
            status: salida_status,
        });

        res.json(salida);
    } catch (error) {
        console.error('updateSalidaStatus error:', error);
        res.status(500).json({ error: error.message });
    }
};