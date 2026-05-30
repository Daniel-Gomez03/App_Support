// ============================================
// CONTROLADOR DE HISTORIAL DE TICKETS
// Proporciona acceso al registro completo de
// todos los tickets del sistema sin filtro de
// estado activo, permitiendo al administrador
// consultar y editar casos finalizados,
// cancelados o en cualquier etapa del flujo.
// ============================================

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

// ============================================
// INCLUDE ESTÁNDAR DE RELACIONES
// Carga todas las entidades relacionadas con
// el ticket en una sola consulta: cliente,
// estado, categoría, producto, modelo, evidencias,
// garantía y técnicos asignados.
// ============================================
const FULL_INCLUDE = [
    { model: Customer, as: 'customer' },
    { model: TicketStatus, as: 'status' },
    { model: Category, as: 'category' },
    { model: Product, as: 'product' },
    { model: ProductModel, as: 'productModel', required: false },
    { model: TicketEvidence, as: 'evidences' },
    { model: Warranty, as: 'warranty', required: false },
    { model: User, as: 'assignedUsers' },
];

// ============================================
// OBTENER HISTORIAL COMPLETO DE TICKETS
// A diferencia del módulo de tickets activos,
// esta consulta no aplica filtro sobre
// ticket_status ni ticket_status_id, devolviendo
// todos los registros independientemente de su
// estado para uso en auditoría y consulta
// histórica por parte del administrador.
// ============================================
exports.getHistorialTickets = async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            include: FULL_INCLUDE,
            order: [['created_at', 'DESC']],
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR TICKET DESDE HISTORIAL
// Permite editar prioridad, fecha de vencimiento,
// observaciones de asignación y técnicos asignados
// sobre cualquier ticket, incluidos los cerrados.
// Solo reemplaza los campos presentes en el body
// mediante spread condicional; los omitidos
// conservan su valor actual.
// setAssignedUsers sincroniza la relación
// many-to-many en ticket_assignments de forma
// atómica dentro de la misma transacción.
// Emite 'ticket_updated' al confirmar el commit.
// ============================================
exports.updateHistorialTicket = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { assignedUsers, ticket_priority, ticket_due_date, assignment_remarks } = req.body;

        const ticket = await Ticket.findByPk(id);
        if (!ticket) {
            await t.rollback();
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        await ticket.update({
            ...(ticket_priority !== undefined && { ticket_priority }),
            ...(ticket_due_date !== undefined && { ticket_due_date }),
            ...(assignment_remarks !== undefined && { assignment_remarks: assignment_remarks.trim() }),
        }, { transaction: t });

        if (Array.isArray(assignedUsers) && assignedUsers.length > 0) {
            await ticket.setAssignedUsers(
                assignedUsers.map(uid => parseInt(uid)),
                { transaction: t }
            );
        }

        await t.commit();

        const updated = await Ticket.findByPk(id, { include: FULL_INCLUDE });

        const io = req.app.get('io');
        if (io) io.emit('ticket_updated', updated);

        res.json({ message: 'Ticket actualizado correctamente', ticket: updated });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};