const Ticket = require('../models/Ticket');
const TicketEvidence = require('../models/TicketEvidence');
const TicketStatus = require('../models/TicketStatus');
const Category = require('../models/Category');
const Product = require('../models/Product');
const ProductModel = require('../models/ProductModel');
const Warranty = require('../models/Warranty');
const Customer = require('../models/Customer');
const sequelize = require('../config/database');
const { processEvidence } = require('../Middleware/ticketUpload');
const { uploadToFTP } = require('../Utils/ftpClient');
const fs = require('fs');
const { Op } = require('sequelize');


// ============================================
// CREAR TICKET 
// ============================================
exports.createTicket = async (req, res) => {
    const t = await sequelize.transaction();
    const localFilesToCleanup = [];

    try {
        const {
            customer_id, category_id, product_id,
            product_model_id, ticket_subject,
            ticket_description, ticket_serial_number
        } = req.body;

        if (!ticket_subject || ticket_subject.length < 10) {
            return res.status(400).json({ error: 'El asunto es obligatorio (mínimo 10 caracteres)' });
        }
        if (!ticket_description || ticket_description.length < 20) {
            return res.status(400).json({ error: 'La descripción es obligatoria (mínimo 20 caracteres)' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Debe adjuntar al menos una imagen o video como evidencia' });
        }

        let finalStatus = 1;

        if (ticket_serial_number) {
            const warrantyExists = await Warranty.findOne({
                where: { warranty_serial_number: ticket_serial_number }
            });

            if (!warrantyExists) {
                finalStatus = 2;
            }
        } else {

            finalStatus = 1;
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
            ticket_status: 1
        }, { transaction: t });

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const processed = await processEvidence(file);
                localFilesToCleanup.push(processed.filePath);

                const ftpUrl = await uploadToFTP(processed.filePath, processed.fileName);

                await TicketEvidence.create({
                    ticket_id: newTicket.ticket_id,
                    ticket_evidence_path: ftpUrl
                }, { transaction: t });
            }
        }

        await t.commit();

        localFilesToCleanup.forEach(path => {
            if (fs.existsSync(path)) fs.unlinkSync(path);
        });

        const io = req.app.get('io');
        if (io) io.emit('new_ticket_created', newTicket);

        res.status(201).json({
            message: finalStatus === 2
                ? 'Ticket creado. Requiere revisión manual de garantía.'
                : 'Ticket creado con éxito.',
            ticket: newTicket
        });

    } catch (error) {
        await t.rollback();
        localFilesToCleanup.forEach(path => {
            if (fs.existsSync(path)) fs.unlinkSync(path);
        });
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER UN TICKET POR ID 
// ============================================
exports.getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id, {
            include: [
                { model: Customer, as: 'customer' },
                { model: TicketStatus, as: 'status' },
                { model: Category, as: 'category' },
                { model: Product, as: 'product' },
                { model: ProductModel, as: 'productModel', required: false },
                { model: TicketEvidence, as: 'evidences' }
            ]
        });

        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER TICKETS ACTIVOS POR CLIENTE (HOME)
// ============================================
exports.getTicketsActivosByCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const tickets = await Ticket.findAll({
            where: {
                customer_id: id,
                ticket_status_id: {
                    [Op.in]: [1, 2] 
                }
            },
            include: [
                { model: TicketStatus, as: 'status' },
                { model: Category, as: 'category' },
                { model: Product, as: 'product' },
                { model: ProductModel, as: 'productModel', required: false },
                { model: TicketEvidence, as: 'evidences' }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(tickets);
    } catch (error) {
        console.error("Error al obtener tickets activos:", error);
        res.status(500).json({ error: 'Error al obtener tickets activos' });
    }
};

// ============================================
// OBTENER TICKETS POR CLIENTE 
// ============================================
exports.getTicketsByCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const tickets = await Ticket.findAll({
            where: {
                customer_id: id,
                ticket_status_id: {
                    [Op.in]: [8, 9]
                }
            },
            include: [
                { model: TicketStatus, as: 'status' },
                { model: Category, as: 'category' },
                { model: Product, as: 'product' },
                { model: ProductModel, as: 'productModel', required: false },
                { model: TicketEvidence, as: 'evidences' }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(tickets);
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ error: 'Error al obtener el historial de tickets' });
    }
};

// ============================================
// OBTENER TODOS LOS TICKETS
// ============================================
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            where: { ticket_status: 1 },
            include: [
                { model: Customer, as: 'customer' },
                { model: TicketStatus, as: 'status' },
                { model: Category, as: 'category' },
                { model: Product, as: 'product' },
                {
                    model: ProductModel,
                    as: 'productModel',
                    required: false
                },
                { model: TicketEvidence, as: 'evidences' }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// EDITAR TICKET
// ============================================
exports.updateTicket = async (req, res) => {
    try {
        const { ticket_subject, ticket_description } = req.body;
        const ticket = await Ticket.findByPk(req.params.id);

        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        if (ticket_subject && ticket_subject.length < 10) {
            return res.status(400).json({ error: 'El asunto debe tener al menos 10 caracteres' });
        }
        if (ticket_description && ticket_description.length < 20) {
            return res.status(400).json({ error: 'La descripción debe tener al menos 20 caracteres' });
        }

        await ticket.update(req.body);
        res.json({ message: 'Ticket actualizado correctamente', ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// TOGGLE TICKET (Activo/Inactivo)
// ============================================
exports.toggleTicketActive = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        ticket.ticket_status = !ticket.ticket_status;
        await ticket.save();

        res.json({
            message: `Ticket ${ticket.ticket_status ? 'activado' : 'desactivado'}`,
            ticket
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR TICKET 
// ============================================
exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        await ticket.destroy();
        res.json({ message: 'Ticket eliminado permanentemente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};