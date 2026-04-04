const TicketStatus = require('../models/TicketStatus');

// ============================================
// OBTENER TODOS LOS ESTADOS DE TICKETS ACTIVOS
// ============================================
exports.getAllTicketStatuses = async (req, res) => {
    try {
        const statuses = await TicketStatus.findAll({
            where: { ticket_status: 1 }
        });
        res.json(statuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER TODOS LOS ESTADOS DE TICKETS INACTIVOS
// ============================================
exports.getAllTicketStatusesInactives = async (req, res) => {
    try {
        const statuses = await TicketStatus.findAll({
            where: { ticket_status: 0 }
        });
        res.json(statuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR UN NUEVO ESTADO 
// ============================================
exports.createTicketStatus = async (req, res) => {
    try {
        const { ticket_status_name } = req.body;

        if (!ticket_status_name) {
            return res.status(400).json({ error: 'El nombre del estado es requerido' });
        }

        const newStatus = await TicketStatus.create({ 
            ticket_status_name 
        });

        const io = req.app.get('io');
        if (io) {
            io.emit('ticketStatus_created', newStatus);
        }

        res.status(201).json(newStatus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// ============================================
// EDITAR UN ESTADO
// ============================================
exports.updateTicketStatus = async (req, res) => {
    try {
        const status = await TicketStatus.findByPk(req.params.id);
        if (!status) return res.status(404).json({ error: 'Estado no encontrado' });

        await status.update(req.body);
        res.json({ message: 'Estado actualizado correctamente', status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR UN ESTADO
// ============================================
exports.deleteTicketStatus = async (req, res) => {
    try {
        const status = await TicketStatus.findByPk(req.params.id);
        if (!status) return res.status(404).json({ error: 'Estado no encontrado' });

        await status.destroy();
        res.json({ message: 'Estado eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ============================================
// CAMBIAR ESTADO (Activo e Inactivo)
// ============================================
exports.toggleTicketStatus = async (req, res) => {
    try {
        const status = await TicketStatus.findByPk(req.params.id);
        if (!status) return res.status(404).json({ error: 'Estado no encontrado' });

        status.ticket_status = !status.ticket_status;
        await status.save();

        res.json({
            message: `Estado ${status.ticket_status ? 'activado' : 'desactivado'}`,
            status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};