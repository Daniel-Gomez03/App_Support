const cron = require('node-cron');
const { QueryTypes, Op } = require('sequelize');
const sequelize = require('../config/database');
const Ticket = require('../models/Ticket');
const TicketStatus = require('../models/TicketStatus');
const TicketComment = require('../models/TicketComment');
const { encrypt } = require('../Utils/encryption');

const THRESHOLD_MINUTES = 60;

const AUTO_MSG = '🔴 Tu ticket ha quedado pendiente de tu respuesta. Para retomar la atención escribe nuevamente.';

const initPendingInfoJob = (io) => {
    cron.schedule('*/15 * * * *', async () => {
        try {
            const pendingStatus = await TicketStatus.findOne({
                where: sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('ticket_status_name')),
                    { [Op.like]: '%pendiente%info%' }
                )
            });

            if (!pendingStatus) {
                console.warn('[PendingInfoJob] Estado "Pendiente de información" no encontrado en BD, saltando.');
                return;
            }

            const pendingStatusId = Number(pendingStatus.ticket_status_id);
            const threshold = new Date(Date.now() - THRESHOLD_MINUTES * 60 * 1000);

            // user_id IS NOT NULL already excludes system messages (user_id = null)
            const rows = await sequelize.query(`
                SELECT t.ticket_id, t.customer_id, t.ticket_subject, t.ticket_status_id AS old_status_id
                FROM tickets t
                INNER JOIN ticket_comments tc ON tc.ticket_id = t.ticket_id
                WHERE tc.user_id IS NOT NULL
                  AND tc.customer_id IS NULL
                  AND tc.created_at < :threshold
                  AND t.ticket_status_id NOT IN (8, 9, 10, :pendingStatusId)
                  AND NOT EXISTS (
                      SELECT 1 FROM ticket_comments tc2
                      WHERE tc2.ticket_id = tc.ticket_id
                        AND tc2.created_at > tc.created_at
                  )
            `, {
                replacements: { threshold, pendingStatusId },
                type: QueryTypes.SELECT,
            });

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