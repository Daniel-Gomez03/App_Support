// ============================================
// CONTROLADOR DEL DASHBOARD
// Devuelve en una sola petición todas las
// estadísticas que necesita el panel principal:
// tarjetas de resumen con % de cambio mensual,
// distribución de tickets por prioridad, casos
// por técnico, resumen global de estados y
// top 5 de técnicos mejor calificados.
// Todas las consultas se ejecutan en paralelo
// con Promise.all para minimizar la latencia.
// ============================================

const { Op, Sequelize } = require('sequelize');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Rating = require('../models/Rating');
const TicketAssignment = require('../models/TicketAssignment');

// ============================================
// ESTADÍSTICAS GENERALES DEL DASHBOARD
// Los rangos de fecha se calculan con objetos
// Date de JavaScript para manejar el cambio de
// año en enero sin aritmética manual de meses.
//
// Si el usuario es Admin: retorna datos globales.
// Si no es Admin: filtra todas las queries a los
// tickets asignados a ese usuario específico.
// Los IDs asignados se obtienen antes del
// Promise.all para reutilizarlos en cada query.
//
// Queries en paralelo (11 total):
//  1-2. Ticket.count activos (1-8) ahora vs mes prev → % pendientes
//  3-4. Ticket.count finalizados (9) este mes vs prev → % finalizados
//  5-7. Ticket.count creados este mes / mes ant / dos meses
//    8. Ticket.findAll agrupado por prioridad
//    9. User.findAll con assignedTickets → pivot JS estados 4-10
//   10. Ticket.findAll agrupado por ticket_status_id → pivot JS
//   11. User.findAll con assignedTickets.ratings → top 5 por rating
// ============================================
exports.getDashboardStats = async (req, res) => {
    try {
        const isAdmin = req.user.rol === 'Admin';
        const userId = req.user.user_id;

        const now = new Date();
        const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startTwoAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // Para no-Admin: obtener los ticket_id asignados a este usuario.
        // Se usa [0] como fallback para evitar IN() vacío que rompe SQL.
        let ticketIdFilter = {};
        if (!isAdmin) {
            const assignments = await TicketAssignment.findAll({
                where: { user_id: userId },
                attributes: ['ticket_id'],
                raw: true,
            });
            const assignedIds = assignments.map(a => a.ticket_id);
            ticketIdFilter = { ticket_id: { [Op.in]: assignedIds.length ? assignedIds : [0] } };
        }

        const [
            pendientesNow,
            pendientesPrev,
            finalizadosNow,
            finalizadosPrev,
            mesActual,
            mesAnterior,
            dosMeses,
            priorities,
            rawCasesByUser,
            rawPendingRows,
            rawFeedback,
        ] = await Promise.all([

            // 1. Tickets activos totales ahora (estados 1-8)
            Ticket.count({
                where: {
                    ticket_status_id: { [Op.between]: [1, 8] },
                    ticket_status: 1,
                    ...ticketIdFilter,
                },
            }),

            // 2. Tickets activos creados el mes pasado (base del % de pendientes)
            Ticket.count({
                where: {
                    ticket_status_id: { [Op.between]: [1, 8] },
                    created_at: { [Op.gte]: startLastMonth, [Op.lt]: startThisMonth },
                    ...ticketIdFilter,
                },
            }),

            // 3. Tickets finalizados (estado 9) este mes
            Ticket.count({
                where: {
                    ticket_status_id: 9,
                    updated_at: { [Op.gte]: startThisMonth, [Op.lt]: startNextMonth },
                    ...ticketIdFilter,
                },
            }),

            // 4. Tickets finalizados el mes anterior
            Ticket.count({
                where: {
                    ticket_status_id: 9,
                    updated_at: { [Op.gte]: startLastMonth, [Op.lt]: startThisMonth },
                    ...ticketIdFilter,
                },
            }),

            // 5. Tickets creados este mes
            Ticket.count({
                where: {
                    created_at: { [Op.gte]: startThisMonth, [Op.lt]: startNextMonth },
                    ...ticketIdFilter,
                },
            }),

            // 6. Tickets creados el mes anterior
            Ticket.count({
                where: {
                    created_at: { [Op.gte]: startLastMonth, [Op.lt]: startThisMonth },
                    ...ticketIdFilter,
                },
            }),

            // 7. Tickets creados hace dos meses
            Ticket.count({
                where: {
                    created_at: { [Op.gte]: startTwoAgo, [Op.lt]: startLastMonth },
                    ...ticketIdFilter,
                },
            }),

            // 8. Distribución por prioridad (sólo tickets activos)
            Ticket.findAll({
                attributes: [
                    'ticket_priority',
                    [Sequelize.fn('COUNT', Sequelize.col('ticket_id')), 'count'],
                ],
                where: {
                    ticket_status_id: { [Op.between]: [1, 8] },
                    ticket_status: 1,
                    ...ticketIdFilter,
                },
                group: ['ticket_priority'],
                raw: true,
            }),

            // 9. Técnicos con sus tickets activos (estados 4-10).
            // No-Admin: limita a este usuario para que CasesByUser
            // solo muestre su propia fila.
            User.findAll({
                where: isAdmin ? {} : { user_id: userId },
                attributes: ['user_id', 'nombre_completo'],
                include: [{
                    model: Ticket,
                    as: 'assignedTickets',
                    attributes: ['ticket_status_id'],
                    through: { attributes: [] },
                    where: {
                        ticket_status: 1,
                        ticket_status_id: { [Op.between]: [4, 10] },
                    },
                    required: true,
                }],
                subQuery: false,
            }),

            // 10. Conteo de tickets por estado (1-10)
            Ticket.findAll({
                attributes: [
                    'ticket_status_id',
                    [Sequelize.fn('COUNT', Sequelize.col('ticket_id')), 'count'],
                ],
                where: { ticket_status: 1, ...ticketIdFilter },
                group: ['ticket_status_id'],
                raw: true,
            }),

            // 11. Técnicos por promedio de calificación.
            // No-Admin: solo retorna su propia entrada de feedback.
            User.findAll({
                where: isAdmin ? {} : { user_id: userId },
                attributes: [
                    'user_id',
                    ['nombre_completo', 'name'],
                    'foto',
                    [Sequelize.fn('ROUND', Sequelize.fn('AVG', Sequelize.col('assignedTickets->ratings.rating_score')), 1), 'rating'],
                    [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('assignedTickets->ratings.rating_id'))), 'totalRatings'],
                ],
                include: [{
                    model: Ticket,
                    as: 'assignedTickets',
                    attributes: [],
                    through: { attributes: [] },
                    required: true,
                    include: [{
                        model: Rating,
                        as: 'ratings',
                        attributes: [],
                        required: true,
                    }],
                }],
                group: ['User.user_id', 'User.nombre_completo', 'User.foto'],
                order: [[Sequelize.fn('AVG', Sequelize.col('assignedTickets->ratings.rating_score')), 'DESC']],
                limit: isAdmin ? 5 : undefined,
                subQuery: false,
                raw: true,
            }),
        ]);

        // ============================================
        // POST-PROCESO — PIVOT CASOS POR TÉCNICO
        // Agrupa en JS los tickets de cada técnico
        // por estado y ordena por carga activa (4-8).
        // ============================================
        const casesByUser = rawCasesByUser.map(user => {
            const tickets = user.assignedTickets ?? [];
            const count = (sid) => tickets.filter(t => Number(t.ticket_status_id) === sid).length;
            const asignado = count(4);
            const enProceso = count(5);
            const pendienteInfo = count(6);
            const escalado = count(7);
            const solCancelacion = count(8);
            return {
                usuario: user.nombre_completo,
                asignado,
                enProceso,
                pendienteInfo,
                escalado,
                solCancelacion,
                finalizado: count(9),
                cancelado: count(10),
                _active: asignado + enProceso + pendienteInfo + escalado + solCancelacion,
            };
        }).sort((a, b) => b._active - a._active)
            .map(({ _active, ...rest }) => rest);

        // ============================================
        // POST-PROCESO — PIVOT RESUMEN GLOBAL
        // Convierte el array de { ticket_status_id,
        // count } en un objeto con claves nombradas.
        // ============================================
        const STATUS_KEYS = {
            1: 'nuevo', 2: 'revisionGarantia',
            3: 'porAsignar', 4: 'asignado',
            5: 'enProceso', 6: 'pendienteInfo',
            7: 'escalado', 8: 'solCancelacion',
            9: 'finalizado', 10: 'cancelado',
        };
        const pendingCases = Object.fromEntries(
            Object.values(STATUS_KEYS).map(k => [k, 0])
        );
        rawPendingRows.forEach(row => {
            const key = STATUS_KEYS[row.ticket_status_id];
            if (key) pendingCases[key] = parseInt(row.count) || 0;
        });

        // foto ya es la URL completa que guardó el portal SSO; se pasa
        // directamente como avatar. null cuando no hay foto válida.
        const recentFeedback = rawFeedback.map(tech => ({
            ...tech,
            avatar: tech.foto && tech.foto !== '' && tech.foto !== 'default.jpg'
                ? tech.foto
                : null,
        }));

        // ============================================
        // HELPER — PORCENTAJE DE CAMBIO MENSUAL
        // Devuelve 100 si el período anterior era 0
        // y el actual tiene registros (crecimiento
        // desde cero), o 0 si ambos son cero.
        // ============================================
        const pct = (current, previous) => {
            const c = parseInt(current) || 0;
            const p = parseInt(previous) || 0;
            if (p === 0) return c > 0 ? 100 : 0;
            return Math.round(((c - p) / p) * 100);
        };

        // Convertir filas de prioridades a formato { name, value, color }
        const priorityMap = { Alta: 0, Media: 0, Baja: 0 };
        priorities.forEach(row => {
            if (row.ticket_priority && row.ticket_priority in priorityMap) {
                priorityMap[row.ticket_priority] = parseInt(row.count) || 0;
            }
        });
        const prioritiesData = [
            { name: 'Alta', value: priorityMap.Alta, color: '#DC2626' },
            { name: 'Media', value: priorityMap.Media, color: '#EAB308' },
            { name: 'Baja', value: priorityMap.Baja, color: '#105030' },
        ];

        res.json({
            cards: {
                pendientes: pendientesNow || 0,
                pendientesPct: pct(pendientesNow, pendientesPrev),
                finalizados: finalizadosNow || 0,
                finalizadosPct: pct(finalizadosNow, finalizadosPrev),
                mesActual: mesActual || 0,
                mesActualPct: pct(mesActual, mesAnterior),
                mesAnterior: mesAnterior || 0,
                mesAnteriorPct: pct(mesAnterior, dosMeses),
            },
            priorities: prioritiesData,
            casesByUser,
            pendingCases,
            recentFeedback,
        });
    } catch (error) {
        console.error('getDashboardStats error:', error);
        res.status(500).json({ error: error.message });
    }
};