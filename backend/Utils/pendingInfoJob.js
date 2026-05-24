// ============================================
// UTIL: PENDING INFO JOB
// Cron que corre cada 15 min y detecta tickets
// donde el técnico hizo la última pregunta
// y el cliente no ha respondido en más de
// THRESHOLD_MINUTES minutos.
//
// Cuando detecta un ticket elegible:
//   1. Cambia el estado a "Pendiente de info".
//   2. Inserta un comentario de sistema cifrado
//      (user_id = null, customer_id = null
//      indica mensaje automático del sistema).
//   3. Emite eventos Socket para actualizar el
//      panel web y notificar la app móvil.
//
// Detección en dos pasos para evitar SQL crudo:
//   a. Carga tickets activos con todos sus
//      comentarios mediante include 'comments'.
//   b. Filtra en JS: el comentario más reciente
//      debe ser de técnico y anterior al umbral.
//   Esto reproduce la lógica del NOT EXISTS
//   original sin raw SQL ni Sequelize.literal.
//
// EXCLUDED_STATUS_IDS: estados terminales que
// nunca deben procesarse (Cerrado, Cancelado,
// Rechazado). El estado "Pendiente de info"
// se excluye dinámicamente tras resolverse.
// ============================================

const cron = require('node-cron');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Ticket = require('../models/Ticket');
const TicketStatus = require('../models/TicketStatus');
const TicketComment = require('../models/TicketComment');
const { encrypt } = require('../Utils/encryption');

const THRESHOLD_MINUTES = 60;
const EXCLUDED_STATUS_IDS = [8, 9, 10]; // Cerrado, Cancelado, Rechazado

const AUTO_MSG = '🔴 Tu ticket ha quedado pendiente de tu respuesta. Para retomar la atención escribe nuevamente.';

const initPendingInfoJob = (io) => {
    cron.schedule('*/15 * * * *', async () => {
        try {
            const pendingStatus = await TicketStatus.findOne({
                where: sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('ticket_status_name')),
                    { [Op.like]: '%pendiente%info%' }
                ),
            });

            if (!pendingStatus) {
                console.warn('[PendingInfoJob] Estado "Pendiente de información" no encontrado en BD, saltando.');
                return;
            }

            const pendingStatusId = Number(pendingStatus.ticket_status_id);
            const threshold = new Date(Date.now() - THRESHOLD_MINUTES * 60 * 1000);

            const candidates = await Ticket.findAll({
                attributes: ['ticket_id', 'customer_id', 'ticket_subject', 'ticket_status_id'],
                where: {
                    ticket_status_id: {
                        [Op.notIn]: [...EXCLUDED_STATUS_IDS, pendingStatusId],
                    },
                },
                include: [{
                    model: TicketComment,
                    as: 'comments',
                    attributes: ['user_id', 'customer_id', 'created_at'],
                    required: true,
                }],
            });

            // El último comentario del ticket debe ser de técnico (user_id != null,
            // customer_id = null) y anterior al umbral para ser elegible.
            const rows = candidates.reduce((acc, ticket) => {
                const lastComment = ticket.comments
                    .slice()
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

                if (
                    lastComment &&
                    lastComment.user_id !== null &&
                    lastComment.customer_id === null &&
                    new Date(lastComment.created_at) < threshold
                ) {
                    acc.push({
                        ticket_id: ticket.ticket_id,
                        customer_id: ticket.customer_id,
                        ticket_subject: ticket.ticket_subject,
                        old_status_id: ticket.ticket_status_id,
                    });
                }
                return acc;
            }, []);

            for (const row of rows) {
                await Ticket.update(
                    { ticket_status_id: pendingStatusId },
                    { where: { ticket_id: row.ticket_id } }
                );

                const autoComment = await TicketComment.create({
                    ticket_id: row.ticket_id,
                    user_id: null,
                    customer_id: null,
                    comment_text: encrypt(AUTO_MSG),
                });

                const commentPayload = {
                    ...autoComment.toJSON(),
                    comment_text: AUTO_MSG,
                    attachments: [],
                    author: null,
                    customerAuthor: null,
                };

                if (io) {
                    const updatedTicket = await Ticket.findByPk(row.ticket_id);
                    io.emit('ticket_updated', updatedTicket);
                    io.emit(`ticket_comment_${row.ticket_id}`, commentPayload);

                    io.emit(`mobile_notification_${row.customer_id}`, {
                        type: 'status_change',
                        ticketId: row.ticket_id,
                        ticketSubject: row.ticket_subject,
                        oldStatusId: Number(row.old_status_id),
                        newStatusId: pendingStatusId,
                        timestamp: new Date().toISOString(),
                    });
                }

                console.log(`[PendingInfoJob] Ticket #${row.ticket_id} → Pendiente de información`);
            }

            if (rows.length > 0) {
                console.log(`[PendingInfoJob] ${rows.length} ticket(s) actualizados`);
            }
        } catch (err) {
            console.error('[PendingInfoJob] Error:', err.message);
        }
    });

    console.log(`[PendingInfoJob] Job iniciado — revisión cada 15 min, umbral ${THRESHOLD_MINUTES} min`);
};

module.exports = { initPendingInfoJob };