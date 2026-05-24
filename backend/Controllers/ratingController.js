// ============================================
// CONTROLADOR DE CALIFICACIONES
// Devuelve el historial completo de valoraciones
// realizadas por clientes al cierre de sus
// tickets. Cada fila incluye los datos del
// cliente, el asunto del ticket y los técnicos
// asignados como array via assignedUsers.
// ============================================

const Rating = require('../models/Rating');
const Ticket = require('../models/Ticket');
const Customer = require('../models/Customer');
const User = require('../models/User');

// ============================================
// OBTENER TODAS LAS CALIFICACIONES
// Devuelve cada rating con su ticket (incluyendo
// los técnicos asignados via assignedUsers) y
// su cliente. Ordenado por fecha DESC.
// ============================================
exports.getRatings = async (req, res) => {
    try {
        const ratings = await Rating.findAll({
            include: [
                {
                    model: Ticket,
                    as: 'ticket',
                    attributes: ['ticket_id', 'ticket_subject'],
                    include: [{
                        model: User,
                        as: 'assignedUsers',
                        attributes: ['user_id', 'nombre_completo', 'foto'],
                        through: { attributes: [] },
                    }],
                },
                {
                    model: Customer,
                    as: 'customer',
                    attributes: [
                        'customer_id',
                        'customer_first_name',
                        'customer_last_name',
                        'customer_image',
                        'customer_company',
                    ],
                },
            ],
            order: [['rating_createdAt', 'DESC']],
        });

        res.json(ratings);
    } catch (error) {
        console.error('getRatings error:', error);
        res.status(500).json({ error: error.message });
    }
};