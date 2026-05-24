// ============================================
// CONTROLADOR DE GARANTÍAS
// Gestiona el registro individual y carga masiva
// de garantías de equipos identificadas por
// número de serie. También administra la política
// de garantía activa que se publica en la app
// móvil. La validación de fechas normaliza
// formatos YYYY-MM-DD, DD/MM/YYYY y seriales
// numéricos de Excel para garantizar consistencia
// en la base de datos. Cada escritura emite un
// evento Socket.io para sincronizar el panel.
// ============================================

const Warranty = require('../models/Warranty');
const WarrantyPolicy = require('../models/WarrantyPolicy');
const XLSX = require('xlsx');
const Papa = require('papaparse');

// ============================================
// HELPER: NORMALIZAR FECHA A MYSQL
// Acepta YYYY-MM-DD y DD/MM/YYYY. Fija la hora
// a las 12:00:00 para evitar desfases de zona
// horaria al almacenar en MySQL DATE/DATETIME.
// ============================================
const formatToMySQLDate = (dateStr) => {
    if (!dateStr) return null;

    let d;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d_part] = dateStr.split('-').map(Number);
        d = new Date(y, m - 1, d_part, 12, 0, 0);
    } else if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        d = new Date(year, month - 1, day, 12, 0, 0);
    } else {
        d = new Date(dateStr);
        d.setHours(12, 0, 0, 0);
    }

    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day} 12:00:00`;
};

// ============================================
// OBTENER TODAS LAS GARANTÍAS
// Devuelve el catálogo completo (activas e
// inactivas) ordenado por ID ASC para
// mantener el orden de registro.
// ============================================
exports.getAllWarranties = async (req, res) => {
    try {
        const warranties = await Warranty.findAll({
            order: [['warranty_id', 'ASC']],
        });
        res.json(warranties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// VALIDAR GARANTÍA POR NÚMERO DE SERIE
// Usada por la app móvil para consultar si un
// equipo tiene garantía activa y si está vigente.
// Devuelve is_expired y expiry_date para que el
// cliente muestre el estado al usuario final.
// ============================================
exports.checkWarrantyBySerial = async (req, res) => {
    try {
        const { serial } = req.params;

        if (!serial) {
            return res.status(400).json({ error: 'El número de serie es requerido.' });
        }

        const warranty = await Warranty.findOne({
            where: {
                warranty_serial_number: serial.trim(),
                warranty_status: 1,
            },
        });

        if (!warranty) {
            return res.status(404).json({
                exists: false,
                message: 'El serial no existe en el sistema de garantías.',
            });
        }

        res.json({
            exists: true,
            is_expired: warranty.is_expired,
            expiry_date: warranty.warranty_expiry_date,
            message: warranty.is_expired
                ? 'El serial existe pero la garantía ha expirado.'
                : 'Garantía vigente y validada.',
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR UNA NUEVA GARANTÍA
// Valida longitud mínima de serial (16) y
// factura (4), y que la fecha de compra no sea
// anterior a 2020 ni futura. El serial y la
// factura tienen restricción UNIQUE en BD;
// SequelizeUniqueConstraintError se mapea a 400.
// Emite 'warranty_created'.
// ============================================
exports.createWarranty = async (req, res) => {
    try {
        const { warranty_serial_number, warranty_invoice_number, warranty_purchase_date } = req.body;

        if (!warranty_serial_number || warranty_serial_number.trim().length < 16) {
            return res.status(400).json({ error: 'El número de serie debe tener al menos 16 caracteres' });
        }
        if (!warranty_invoice_number || warranty_invoice_number.trim().length < 4) {
            return res.status(400).json({ error: 'El número de factura debe tener al menos 4 caracteres' });
        }
        if (!warranty_purchase_date) {
            return res.status(400).json({ error: 'La fecha de compra es obligatoria' });
        }

        const [year, month, day] = warranty_purchase_date.split('-').map(Number);
        const purchaseDate = new Date(year, month - 1, day, 12, 0, 0);
        const minDate = new Date(2020, 0, 1);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (purchaseDate < minDate) {
            return res.status(400).json({ error: 'No se permiten registros anteriores al año 2020' });
        }
        if (purchaseDate > today) {
            return res.status(400).json({ error: 'La fecha de compra no puede ser futura' });
        }

        const warranty = await Warranty.create({
            warranty_serial_number: warranty_serial_number.trim(),
            warranty_invoice_number: warranty_invoice_number.trim(),
            warranty_purchase_date: formatToMySQLDate(warranty_purchase_date),
            warranty_status: true,
        });

        const io = req.app.get('io');
        if (io) io.emit('warranty_created', warranty);

        res.status(201).json(warranty);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'El número de serie o el número de factura ya existen en el sistema',
            });
        }
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR GARANTÍA
// Conserva los valores actuales en campos no
// enviados usando ??. Mapea
// SequelizeUniqueConstraintError a 400 si el
// nuevo serial o factura ya están en uso.
// Emite 'warranty_updated'.
// ============================================
exports.updateWarranty = async (req, res) => {
    try {
        const { id } = req.params;
        const { warranty_serial_number, warranty_invoice_number, warranty_purchase_date } = req.body;

        const warranty = await Warranty.findByPk(id);
        if (!warranty) return res.status(404).json({ error: 'Garantía no encontrada' });

        if (warranty_serial_number && warranty_serial_number.trim().length < 16) {
            return res.status(400).json({ error: 'El serial debe tener al menos 16 caracteres' });
        }

        const updateData = {
            warranty_serial_number: warranty_serial_number?.trim() ?? warranty.warranty_serial_number,
            warranty_invoice_number: warranty_invoice_number?.trim() ?? warranty.warranty_invoice_number,
            warranty_purchase_date: warranty_purchase_date
                ? formatToMySQLDate(warranty_purchase_date)
                : warranty.warranty_purchase_date,
        };

        await warranty.update(updateData);

        const io = req.app.get('io');
        if (io) io.emit('warranty_updated', warranty);

        res.json({ message: 'Garantía actualizada con éxito', warranty });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'El serial o la factura ya están registrados' });
        }
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CAMBIAR ESTADO DE GARANTÍA (toggle)
// Activa o desactiva la garantía sin eliminarla.
// Emite 'warranty_toggled' para sincronizar el
// panel sin recargar la lista completa.
// ============================================
exports.toggleWarrantyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const warranty = await Warranty.findByPk(id);
        if (!warranty) return res.status(404).json({ error: 'Garantía no encontrada' });

        const nuevoEstado = !warranty.warranty_status;
        await warranty.update({ warranty_status: nuevoEstado });

        const io = req.app.get('io');
        if (io) io.emit('warranty_toggled', { warranty_id: warranty.warranty_id, warranty_status: nuevoEstado });

        res.json({ message: 'Estado actualizado', warranty_status: nuevoEstado });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CARGA MASIVA DE GARANTÍAS (XLSX / CSV)
// Procesa archivos fila por fila acumulando
// errores en lugar de abortar ante el primero,
// para que el usuario pueda corregir su archivo
// en un solo ciclo. Los registros duplicados
// (por serial) se omiten sin error usando
// findOrCreate. Emite 'warranties_bulk_updated'
// solo si se creó al menos un registro nuevo.
// ============================================
exports.bulkUploadWarranties = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se proporcionó ningún archivo.' });

        let data = [];
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else if (fileExtension === 'csv') {
            data = Papa.parse(req.file.buffer.toString('utf-8'), { header: true, skipEmptyLines: true }).data;
        }

        if (data.length === 0) return res.status(400).json({ error: 'El archivo está vacío.' });

        const results = { total: data.length, created: 0, skipped: 0, errors: [] };
        const today = new Date();
        const minDate = new Date(2020, 0, 1);

        for (const [index, row] of data.entries()) {
            const rowNumber = index + 2;
            try {
                const { warranty_serial_number, warranty_invoice_number, warranty_purchase_date } = row;

                const serial = String(warranty_serial_number || '').trim();
                const invoice = String(warranty_invoice_number || '').trim();

                if (serial.length < 16) throw new Error('S/N insuficiente (Mín. 16).');
                if (invoice.length < 4) throw new Error('Factura insuficiente (Mín. 4).');

                let finalDate;
                if (typeof warranty_purchase_date === 'number') {
                    const dateObj = XLSX.SSF.parse_date_code(warranty_purchase_date);
                    finalDate = new Date(dateObj.y, dateObj.m - 1, dateObj.d, 12, 0, 0);
                } else {
                    const dateParts = String(warranty_purchase_date).split(/[-/]/);
                    if (dateParts.length === 3) {
                        finalDate = dateParts[0].length === 4
                            ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0)
                            : new Date(dateParts[2], dateParts[1] - 1, dateParts[0], 12, 0, 0);
                    } else {
                        finalDate = new Date(warranty_purchase_date);
                        finalDate.setHours(12, 0, 0, 0);
                    }
                }

                if (isNaN(finalDate.getTime())) throw new Error('Fecha inválida.');
                if (finalDate < minDate || finalDate > today) throw new Error('Fecha fuera de rango.');

                const py = finalDate.getFullYear();
                const pm = String(finalDate.getMonth() + 1).padStart(2, '0');
                const pd = String(finalDate.getDate()).padStart(2, '0');
                const formattedPurchaseDate = `${py}-${pm}-${pd} 12:00:00`;

                const [, created] = await Warranty.findOrCreate({
                    where: { warranty_serial_number: serial },
                    defaults: {
                        warranty_invoice_number: invoice,
                        warranty_purchase_date: formattedPurchaseDate,
                        warranty_status: true,
                    },
                });

                if (created) results.created++;
                else results.skipped++;
            } catch (err) {
                results.errors.push({
                    row: rowNumber,
                    serial: row.warranty_serial_number || 'N/A',
                    error: err.message,
                });
            }
        }

        if (results.created > 0) {
            const io = req.app.get('io');
            if (io) io.emit('warranties_bulk_updated', { created: results.created });
        }

        res.json({ message: 'Proceso finalizado.', summary: results });
    } catch (error) {
        console.error('bulkUploadWarranties error:', error);
        res.status(500).json({ error: 'Error interno en la carga masiva.' });
    }
};

// ============================================
// OBTENER POLÍTICA DE GARANTÍA ACTIVA
// Devuelve la versión más reciente marcada como
// activa. La app móvil la consume para mostrar
// los términos de garantía al usuario final.
// ============================================
exports.getPolicy = async (req, res) => {
    try {
        const policy = await WarrantyPolicy.findOne({
            where: { policy_is_active: 1 },
            order: [['created_at', 'DESC']],
        });

        if (!policy) {
            return res.status(404).json({ error: 'No hay política de garantía activa.' });
        }

        res.json(policy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR POLÍTICA DE GARANTÍA
// Desactiva todas las políticas anteriores y
// crea una nueva versión activa en la misma
// transacción lógica (update + create). El
// historial de versiones queda preservado con
// policy_is_active = 0. Emite
// 'warranty_policy_updated' con la nueva versión.
// ============================================
exports.updatePolicy = async (req, res) => {
    try {
        const { policy_version, policy_updated_label, policy_content } = req.body;

        if (!policy_version || !policy_updated_label || !policy_content) {
            return res.status(400).json({ error: 'Versión, etiqueta y contenido son obligatorios.' });
        }

        if (!Array.isArray(policy_content) || policy_content.length === 0) {
            return res.status(400).json({ error: 'El contenido debe ser un arreglo de secciones.' });
        }

        await WarrantyPolicy.update(
            { policy_is_active: 0 },
            { where: { policy_is_active: 1 } },
        );

        const newPolicy = await WarrantyPolicy.create({
            policy_version,
            policy_updated_label,
            policy_content,
            policy_is_active: 1,
        });

        const io = req.app.get('io');
        if (io) io.emit('warranty_policy_updated', {
            version: newPolicy.policy_version,
            updated_label: newPolicy.policy_updated_label,
        });

        res.status(201).json({
            message: `Política actualizada a ${policy_version} correctamente.`,
            policy: newPolicy,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};