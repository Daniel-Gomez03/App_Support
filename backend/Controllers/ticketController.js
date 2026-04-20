const Ticket = require('../models/Ticket');
const TicketEvidence = require('../models/TicketEvidence');
const TicketStatus = require('../models/TicketStatus');
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
const { Op } = require('sequelize');

// ============================================
// CREAR TICKET (ADMIN)
// ============================================
exports.createTicketAdmin = async (req, res) => {
    const t = await sequelize.transaction();
    const localFilesToCleanup = [];

    try {
        const {
            customer_id, category_id, product_id,
            product_model_id, ticket_subject,
            ticket_description, ticket_serial_number
        } = req.body;

        if (!customer_id || !category_id || !product_id) {
            return res.status(400).json({ error: 'Faltan datos obligatorios (Cliente, Categoría o Producto).' });
        }

        let finalStatus = 1;

        if (ticket_serial_number) {
            const warranty = await Warranty.findOne({
                where: { warranty_serial_number: ticket_serial_number }
            });

            if (!warranty || warranty.is_expired) {
                finalStatus = 2;
            }
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

        localFilesToCleanup.forEach(path => { if (fs.existsSync(path)) fs.unlinkSync(path); });

        const io = req.app.get('io');
        if (io) io.emit('new_ticket_created', newTicket);

        res.status(201).json({
            message: finalStatus === 2
                ? 'equiere revisión manual de garantía.'
                : 'Ve a Asignar Ticket para poder gestionarlo y asignar colaboradores',
            ticket: newTicket
        });

    } catch (error) {
        await t.rollback();
        localFilesToCleanup.forEach(path => { if (fs.existsSync(path)) fs.unlinkSync(path); });
        res.status(500).json({ error: error.message });
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
                { model: ProductModel, as: 'productModel', required: false },
                { model: TicketEvidence, as: 'evidences' },
                { model: User, as: 'technician', attributes: ['user_id', 'user_name'] }
            ],
            order: [['created_at', 'DESC']]
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
            include: [
                { model: Customer, as: 'customer' },
                { model: TicketStatus, as: 'status' },
                { model: Category, as: 'category' },
                { model: Product, as: 'product' },
                { model: ProductModel, as: 'productModel', required: false },
                { model: TicketEvidence, as: 'evidences' },
                { model: User, as: 'technician' }
            ]
        });

        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR TICKET
// ============================================
exports.updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        const { ticket_subject, ticket_description } = req.body;

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
// BORRADO LÓGICO
// ============================================
exports.toggleTicketActive = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

        ticket.ticket_status = !ticket.ticket_status;
        await ticket.save();

        const io = req.app.get('io');
        if (io) io.emit('ticket_status_changed', ticket);

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

        const io = req.app.get('io');
        if (io) io.emit('ticket_deleted', req.params.id);

        res.json({ message: 'Ticket eliminado permanentemente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};