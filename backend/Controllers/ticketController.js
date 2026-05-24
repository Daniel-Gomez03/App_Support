// ============================================
// CONTROLADOR DE TICKETS
// Gestiona el ciclo de vida completo de los
// tickets de soporte: creación desde el panel
// admin (con evidencias en FTP), asignación a
// técnicos, avance de estados, pausado del chat
// y consultas con relaciones completas.
// Las operaciones críticas (crear, asignar) usan
// transacciones Sequelize para garantizar
// atomicidad. Cada cambio emite eventos
// Socket.io al panel admin y a la app móvil.
// ============================================

const Ticket = require('../models/Ticket');
const TicketEvidence = require('../models/TicketEvidence');
const TicketStatus = require('../models/TicketStatus');
const TicketComment = require('../models/TicketComment');
const TicketAssignment = require('../models/TicketAssignment');
const Rating = require('../models/Rating');
const Category = require('../models/Category');
const Product = require('../models/Product');
const ProductModel = require('../models/ProductModel');
const Warranty = require('../models/Warranty');
const Customer = require('../models/Customer');
const User = require('../models/User');
const sequelize = require('../config/database');
const { processEvidence } = require('../Middleware/ticketUpload');
const { uploadToFTP } = require('../Utils/ftpClient');
const fs = require('fs');
const { Op, Sequelize } = require('sequelize');

// ============================================
// INCLUDE COMPLETO DE RELACIONES
// Carga todas las entidades relacionadas con
// el ticket en una sola consulta. Reutilizado
// en getAllTickets, getTicketById y assignTicket.
// ============================================
const FULL_INCLUDE = [
    { model: Customer, as: 'customer' },
    { model: TicketStatus, as: 'status' },
    { model: Category, as: 'category' },
    { model: Product, as: 'product' },
    { model: ProductModel, as: 'productModel', required: false },
    { model: TicketEvidence, as: 'evidences' },
    { model: Warranty, as: 'warranty' },
    { model: User, as: 'assignedUsers' },
];

// ============================================
// CREAR TICKET (ADMIN)
// Determina el estado inicial según la garantía:
//  · Con número de serie válido → estado 1 (Nuevo)
//  · Sin serie o garantía expirada → estado 2
//    (Revisión de Garantía)
// Las evidencias se procesan y suben al FTP
// dentro de la misma transacción; si falla se
// hace rollback y se limpian los temporales.
// Emite 'new_ticket_created' al panel.
// ============================================
exports.createTicketAdmin = async (req, res) => {
    const t = await sequelize.transaction();
    const localFilesToCleanup = [];

    try {
        const {
            customer_id, category_id, product_id,
            product_model_id, ticket_subject,
            ticket_description, ticket_serial_number,
        } = req.body;

        if (!customer_id || !category_id || !product_id) {
            return res.status(400).json({ error: 'Faltan datos obligatorios (Cliente, Categoría o Producto).' });
        }

        let finalStatus = 1;
        if (ticket_serial_number) {
            const warranty = await Warranty.findOne({
                where: { warranty_serial_number: ticket_serial_number },
            });
            if (!warranty || warranty.is_expired) finalStatus = 2;
        } else {
            finalStatus = 2;
        }

        const newTicket = await Ticket.create({
            customer_id,
            category_id,
            product_id,
            product_model_id: product_model_id || null,
            ticket_status_id: finalStatus,
            ticket_subject,
            ticket_description,
            ticket_serial_number: ticket_serial_number || null,
            ticket_priority: null,
            ticket_status: 1,
        }, { transaction: t });

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const processed = await processEvidence(file);
                localFilesToCleanup.push(processed.filePath);
                const ftpUrl = await uploadToFTP(processed.filePath, processed.fileName);
                await TicketEvidence.create({
                    ticket_id: newTicket.ticket_id,
                    ticket_evidence_path: ftpUrl,
                }, { transaction: t });
            }
        }

        await t.commit();
        localFilesToCleanup.forEach(path => { if (fs.existsSync(path)) fs.unlinkSync(path); });

        const io = req.app.get('io');
        if (io) io.emit('new_ticket_created', newTicket);

        res.status(201).json({
            message: finalStatus === 2
                ? 'Requiere revisión manual de garantía.'
                : 'Ve a Asignar Ticket para poder gestionarlo y asignar colaboradores',
            ticket: newTicket,
        });

    } catch (error) {
        await t.rollback();
        localFilesToCleanup.forEach(path => { if (fs.existsSync(path)) fs.unlinkSync(path); });
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR ESTADO DEL TICKET
// Avanza o retrocede el estado del ticket.
// Emite cuatro tipos de eventos según el estado
// destino:
//  · ticket_updated       → tablero admin
//  · mobile_notification  → cliente (app móvil)
//  · rating_request       → solicitud de calificación
//    al cliente si el ticket finaliza o cancela
//    y aún no ha calificado
// El evento de calificación incluye los técnicos
// asignados para que el cliente pueda evaluarlos.
// ============================================
exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { ticket_status_id } = req.body;

        if (!ticket_status_id) {
            return res.status(400).json({ error: 'El ID del estado es obligatorio.' });
        }

        const ticket = await Ticket.findByPk(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        const oldStatusId = ticket.ticket_status_id;
        await ticket.update({
            ticket_status_id,
            cancellation_requested: 0,
            cancellation_prev_status_id: null,
            chat_paused: 0,
        });

        const io = req.app.get('io');
        if (io) {
            io.emit('ticket_updated', ticket);

            if (ticket.customer_id) {
                const newStatusInt = parseInt(ticket_status_id);
                let notifType = 'status_change';
                if (newStatusInt === 10) notifType = 'ticket_cancelled';
                else if (newStatusInt === 9) notifType = 'ticket_finalizado';
                else if (Number(oldStatusId) === 8) notifType = 'cancellation_rejected';

                io.emit(`mobile_notification_${ticket.customer_id}`, {
                    type: notifType,
                    ticketId: ticket.ticket_id,
                    ticketSubject: ticket.ticket_subject,
                    oldStatusId,
                    newStatusId: newStatusInt,
                    timestamp: new Date().toISOString(),
                });

                // Solicitar calificación al cierre si el cliente aún no ha calificado
                if ([9, 10].includes(newStatusInt)) {
                    const alreadyRated = await Rating.findOne({
                        where: { ticket_id: ticket.ticket_id, customer_id: ticket.customer_id },
                    });
                    if (!alreadyRated) {
                        const ticketWithTechs = await Ticket.findByPk(ticket.ticket_id, {
                            include: [{
                                model: User,
                                as: 'assignedUsers',
                                attributes: ['user_id', 'nombre_completo', 'foto', 'cargo'],
                                through: { attributes: [] },
                            }],
                        });
                        if ((ticketWithTechs?.assignedUsers ?? []).length > 0) {
                            io.emit(`rating_request_${ticket.customer_id}`, {
                                ticketId: ticket.ticket_id,
                                ticketSubject: ticket.ticket_subject,
                                techs: ticketWithTechs.assignedUsers,
                            });
                        }
                    }
                }
            }
        }

        res.json({
            message: `Ticket movido al estado ${ticket_status_id} correctamente.`,
            ticket,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// PAUSAR / REANUDAR CHAT
// Invierte el estado de pausa del chat.
// Cuando se pausa, notifica al cliente en la
// app móvil para que sepa que sus mensajes no
// están siendo procesados.
// ============================================
exports.toggleChatPause = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByPk(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        const newPaused = ticket.chat_paused ? 0 : 1;
        await ticket.update({ chat_paused: newPaused });

        const io = req.app.get('io');
        if (io) {
            const updated = await Ticket.findByPk(id);
            io.emit('ticket_updated', updated);

            if (newPaused === 1 && ticket.customer_id) {
                io.emit(`mobile_notification_${ticket.customer_id}`, {
                    type: 'chat_paused',
                    ticketId: ticket.ticket_id,
                    ticketSubject: ticket.ticket_subject,
                    timestamp: new Date().toISOString(),
                });
            }
        }

        res.json({ chat_paused: newPaused });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER CONTEO DE TICKETS NO ASIGNADOS
// Cuenta tickets en estados 1-3 (Nuevo,
// Revisión Garantía, Por Asignar) para la
// insignia del panel de administración.
// ============================================
exports.getUnassignedTicketCount = async (req, res) => {
    try {
        const count = await Ticket.count({
            where: {
                ticket_status: 1,
                ticket_status_id: { [Op.in]: [1, 2, 3] },
            },
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER CONTEO DE TICKETS ACTIVOS
// Admin: cuenta todos los tickets activos.
// DevSupport: cuenta solo los tickets asignados
// al usuario autenticado via assignedUsers.
// ============================================
exports.getActiveTicketCount = async (req, res) => {
    try {
        const { user_id, rol } = req.user;
        const activeStatuses = [1, 2, 3, 4, 5, 6, 7, 8];

        if (rol === 'Admin') {
            const count = await Ticket.count({
                where: {
                    ticket_status: 1,
                    ticket_status_id: { [Op.in]: activeStatuses },
                },
            });
            return res.json({ count });
        }

        const count = await Ticket.count({
            where: {
                ticket_status: 1,
                ticket_status_id: { [Op.in]: activeStatuses },
            },
            include: [{
                model: User,
                as: 'assignedUsers',
                where: { user_id },
                attributes: [],
            }],
        });
        return res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER LISTA DE TICKETS ACTIVOS
// Admin: todos los tickets activos (estados 1-10).
// DevSupport: solo los tickets asignados al
// usuario autenticado.
// Añade customer_last_reply_at: la fecha del
// último mensaje enviado por el cliente en cada
// ticket, calculada con MAX(created_at) sobre
// los comentarios de clientes (customer_id NOT
// NULL, user_id NULL) mediante TicketComment.
// ============================================
exports.getActiveTickets = async (req, res) => {
    try {
        const { user_id, rol } = req.user;
        const activeStatuses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        let whereTicket = {
            ticket_status: 1,
            ticket_status_id: { [Op.in]: activeStatuses },
        };

        if (rol !== 'Admin') {
            const myTickets = await Ticket.findAll({
                where: whereTicket,
                include: [{
                    model: User,
                    as: 'assignedUsers',
                    where: { user_id },
                    attributes: [],
                }],
                attributes: ['ticket_id'],
            });
            const ticketIds = myTickets.map(t => t.ticket_id);
            whereTicket = { ticket_id: { [Op.in]: ticketIds } };
        }

        const tickets = await Ticket.findAll({
            where: whereTicket,
            include: FULL_INCLUDE,
            order: [['created_at', 'DESC']],
        });

        const ticketIds = tickets.map(t => t.ticket_id);
        let customerReplyMap = {};

        if (ticketIds.length > 0) {
            const rows = await TicketComment.findAll({
                attributes: [
                    'ticket_id',
                    [Sequelize.fn('MAX', Sequelize.col('created_at')), 'customer_last_reply_at'],
                ],
                where: {
                    ticket_id: { [Op.in]: ticketIds },
                    customer_id: { [Op.not]: null },
                    user_id: null,
                },
                group: ['ticket_id'],
                raw: true,
            });
            rows.forEach(r => { customerReplyMap[r.ticket_id] = r.customer_last_reply_at; });
        }

        const result = tickets.map(t => ({
            ...t.toJSON(),
            customer_last_reply_at: customerReplyMap[t.ticket_id] || null,
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ASIGNAR TICKET A TÉCNICO(S)
// Establece prioridad, fecha límite y técnicos
// asignados en una sola transacción. Avanza el
// ticket al estado 4 (Asignado) automáticamente.
// setAssignedUsers sincroniza la relación
// many-to-many en ticket_assignments de forma
// atómica. Emite 'ticket_updated' al confirmar.
// ============================================
exports.assignTicket = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const {
            user_id, assignedUsers,
            ticket_priority, ticket_due_date, assignment_remarks,
        } = req.body;

        const ticket = await Ticket.findByPk(id);
        if (!ticket) {
            await t.rollback();
            return res.status(404).json({ error: 'Ticket no encontrado.' });
        }

        await ticket.update({
            ticket_priority,
            ticket_due_date: ticket_due_date || null,
            assignment_remarks: assignment_remarks || null,
            ticket_status_id: 4,
        }, { transaction: t });

        const allStaff = [parseInt(user_id)];
        if (Array.isArray(assignedUsers)) {
            assignedUsers.forEach(cId => {
                if (!allStaff.includes(parseInt(cId))) allStaff.push(parseInt(cId));
            });
        }

        await ticket.setAssignedUsers(allStaff, { transaction: t });
        await t.commit();

        const updatedTicket = await Ticket.findByPk(id, {
            include: [{ model: User, as: 'assignedUsers' }],
        });

        const io = req.app.get('io');
        if (io) io.emit('ticket_updated', updatedTicket);

        res.json({ message: 'Equipo asignado correctamente', ticket: updatedTicket });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER TODOS LOS TICKETS
// Devuelve todos los tickets activos con sus
// relaciones completas (FULL_INCLUDE).
// ============================================
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            where: { ticket_status: 1 },
            include: FULL_INCLUDE,
            order: [['created_at', 'DESC']],
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER TICKET POR ID
// ============================================
exports.getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id, {
            include: FULL_INCLUDE,
        });
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR TICKET
// Permite editar asunto, descripción y otros
// campos del ticket. Valida longitud mínima
// del asunto. Emite 'ticket_updated'.
// ============================================
exports.updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        const { ticket_subject } = req.body;

        if (ticket_subject && ticket_subject.length < 10) {
            return res.status(400).json({ error: 'Asunto demasiado corto.' });
        }

        await ticket.update(req.body);

        const io = req.app.get('io');
        if (io) io.emit('ticket_updated', ticket);

        res.json({ message: 'Ticket actualizado correctamente', ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// BORRADO LÓGICO (toggle activo/inactivo)
// Invierte ticket_status usando update() en
// lugar de save() para seguir el patrón
// estándar de Sequelize.
// Emite 'ticket_status_changed'.
// ============================================
exports.toggleTicketActive = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        await ticket.update({ ticket_status: !ticket.ticket_status });

        const io = req.app.get('io');
        if (io) io.emit('ticket_status_changed', ticket);

        res.json({
            message: `Ticket ${ticket.ticket_status ? 'activado' : 'desactivado'}`,
            ticket,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR TICKET
// Eliminación física. Emite 'ticket_deleted'
// con el ID para que el tablero retire la
// tarjeta sin recargar la vista completa.
// ============================================
exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        await ticket.destroy();

        const io = req.app.get('io');
        if (io) io.emit('ticket_deleted', req.params.id);

        res.json({ message: 'Ticket eliminado permanentemente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};