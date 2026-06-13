// ============================================
// CONTROLADOR DE ESTADOS DE TICKET
// CRUD completo para el catálogo de estados
// del flujo de atención. Los estados activos
// son los que pueden asignarse a un ticket;
// los inactivos se conservan por historial.
// Cada operación de escritura emite un evento
// Socket.io para sincronizar el panel en tiempo
// real. La unicidad del nombre se valida a
// nivel de BD y se mapea a un 400 descriptivo.
// ============================================

const TicketStatus = require('../models/TicketStatus');

// ============================================
// OBTENER TODOS LOS ESTADOS ACTIVOS
// Devuelve los estados con ticket_status = 1
// ordenados por ID para respetar el orden del
// flujo definido en la base de datos.
// ============================================
exports.getAllTicketStatuses = async (req, res) => {
    try {
        const statuses = await TicketStatus.findAll({
            where: { ticket_status: 1 },
            order: [['ticket_status_id', 'ASC']],
        });
        res.json(statuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER TODOS LOS ESTADOS INACTIVOS
// Usados para mostrar el historial de estados
// desactivados en las vistas de administración.
// ============================================
exports.getAllTicketStatusesInactives = async (req, res) => {
    try {
        const statuses = await TicketStatus.findAll({
            where: { ticket_status: 0 },
            order: [['ticket_status_id', 'ASC']],
        });
        res.json(statuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR UN NUEVO ESTADO
// El nombre es obligatorio y único. Si ya
// existe un estado con el mismo nombre la BD
// lanza SequelizeUniqueConstraintError, que se
// mapea a un 400 descriptivo para el cliente.
// Emite 'ticketStatus_created'.
// ============================================
exports.createTicketStatus = async (req, res) => {
    try {
        const { ticket_status_name } = req.body;

        if (!ticket_status_name || ticket_status_name.trim() === '') {
            return res.status(400).json({ error: 'El nombre del estado es requerido' });
        }

        const newStatus = await TicketStatus.create({
            ticket_status_name: ticket_status_name.trim(),
        });

        const io = req.app.get('io');
        if (io) io.emit('ticketStatus_created', newStatus);

        res.status(201).json(newStatus);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Ya existe un estado con ese nombre.' });
        }
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// EDITAR UN ESTADO
// Actualiza los campos enviados en el body.
// Mapea SequelizeUniqueConstraintError a 400
// si el nuevo nombre ya está en uso.
// Emite 'ticketStatus_updated'.
// ============================================
exports.updateTicketStatus = async (req, res) => {
    try {
        const status = await TicketStatus.findByPk(req.params.id);
        if (!status) return res.status(404).json({ error: 'Estado no encontrado' });

        await status.update(req.body);

        const io = req.app.get('io');
        if (io) io.emit('ticketStatus_updated', status);

        res.json({ message: 'Estado actualizado correctamente', status });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Ese nombre de estado ya está en uso.' });
        }
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR UN ESTADO
// Eliminación física. Emite 'ticketStatus_deleted'
// con el ID para que el panel retire el elemento
// sin recargar la lista completa.
// ============================================
exports.deleteTicketStatus = async (req, res) => {
    try {
        const status = await TicketStatus.findByPk(req.params.id);
        if (!status) return res.status(404).json({ error: 'Estado no encontrado' });

        await status.destroy();

        const io = req.app.get('io');
        if (io) io.emit('ticketStatus_deleted', req.params.id);

        res.json({ message: 'Estado eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CAMBIAR ESTADO (toggle activo/inactivo)
// Invierte ticket_status usando update() en
// lugar de save() para seguir el patrón
// estándar de Sequelize.
// Emite 'ticketStatus_toggled'.
// ============================================
exports.toggleTicketStatus = async (req, res) => {
    try {
        const status = await TicketStatus.findByPk(req.params.id);
        if (!status) return res.status(404).json({ error: 'Estado no encontrado' });

        await status.update({ ticket_status: !status.ticket_status });

        const io = req.app.get('io');
        if (io) io.emit('ticketStatus_toggled', status);

        res.json({
            message: `Estado ${status.ticket_status ? 'activado' : 'desactivado'}`,
            status,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};