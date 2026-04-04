const Warranty = require('../models/Warranty');
const XLSX = require('xlsx');
const Papa = require('papaparse');

const formatToMySQLDate = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
};

// ============================================
// OBTENER TODAS LAS GARANTÍAS
// ============================================
exports.getAllWarranties = async (req, res) => {
    try {
        const warranties = await Warranty.findAll();
        res.json(warranties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR UNA NUEVA GARANTÍA (Manual)
// ============================================
exports.createWarranty = async (req, res) => {
    try {
        let { warranty_serial_number, warranty_purchase_date, warranty_status } = req.body;

        warranty_purchase_date = formatToMySQLDate(warranty_purchase_date);

        const warranty = await Warranty.create({
            warranty_serial_number,
            warranty_purchase_date,
            warranty_status: warranty_status !== undefined ? warranty_status : true
        });

        const io = req.app.get('io');
        if (io) io.emit('warranty_created', warranty);

        res.status(201).json(warranty);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'El número de serie ya existe' });
        }
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR GARANTÍA 
// ============================================
exports.updateWarranty = async (req, res) => {
    try {
        const { id } = req.params;
        let { warranty_serial_number, warranty_purchase_date } = req.body;

        const warranty = await Warranty.findByPk(id);
        if (!warranty) return res.status(404).json({ error: 'Garantía no encontrada' });

        if (warranty_purchase_date) {
            warranty_purchase_date = formatToMySQLDate(warranty_purchase_date);
        }

        await warranty.update({
            warranty_serial_number,
            warranty_purchase_date
        });

        res.json({ message: 'Garantía actualizada con éxito', warranty });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Ese número de serie ya existe en otro registro' });
        }
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR GARANTÍA 
// ============================================
exports.deleteWarranty = async (req, res) => {
    try {
        const { id } = req.params;
        const warranty = await Warranty.findByPk(id);

        if (!warranty) return res.status(404).json({ error: 'Garantía no encontrada' });

        await warranty.destroy();

        res.json({ message: 'Garantía eliminada permanentemente del sistema' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CAMBIAR ESTADO 
// ============================================
exports.toggleWarrantyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const warranty = await Warranty.findByPk(id);

        if (!warranty) return res.status(404).json({ error: 'Garantía no encontrada' });

        const nuevoEstado = !warranty.warranty_status;
        await warranty.update({ warranty_status: nuevoEstado });

        res.json({
            message: `Garantía ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`,
            warranty_status: nuevoEstado
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CARGA MASIVA DE GARANTÍAS 
// ============================================
exports.bulkUploadWarranties = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ningún archivo.' });
        }

        let data = [];
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else if (fileExtension === 'csv') {
            const csv = req.file.buffer.toString('utf-8');
            const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
            data = parsed.data;
        } else {
            return res.status(400).json({ error: 'Formato de archivo no soportado. Use Excel o CSV.' });
        }

        if (data.length === 0) {
            return res.status(400).json({ error: 'El archivo está vacío.' });
        }

        const requiredHeaders = ['warranty_serial_number', 'warranty_purchase_date'];
        const fileHeaders = Object.keys(data[0]);
        const hasValidHeaders = requiredHeaders.every(h => fileHeaders.includes(h));

        if (!hasValidHeaders) {
            return res.status(400).json({
                error: 'Encabezados inválidos en el archivo.',
                required: requiredHeaders
            });
        }

        const results = {
            total: data.length,
            created: 0,
            skipped: 0,
            errors: []
        };

        for (const [index, row] of data.entries()) {
            try {
                let { warranty_serial_number, warranty_purchase_date, warranty_status } = row;

                if (typeof warranty_purchase_date === 'number') {
                    const dateObj = XLSX.SSF.parse_date_code(warranty_purchase_date);
                    warranty_purchase_date = `${dateObj.y}-${String(dateObj.m).padStart(2, '0')}-${String(dateObj.d).padStart(2, '0')}`;
                }
                else if (typeof warranty_purchase_date === 'string') {
                    if (warranty_purchase_date.includes('/')) {
                        const parts = warranty_purchase_date.split('/');
                        const day = parts[0].padStart(2, '0');
                        const month = parts[1].padStart(2, '0');
                        const year = parts[2];
                        warranty_purchase_date = `${year}-${month}-${day}`;
                    }
                }

                const [item, created] = await Warranty.findOrCreate({
                    where: { warranty_serial_number: String(warranty_serial_number).trim() },
                    defaults: {
                        warranty_purchase_date,
                        warranty_status: warranty_status !== undefined ?
                            (String(warranty_status).toLowerCase() === 'true' || warranty_status === 1 || warranty_status === '1') : true
                    }
                });

                if (created) {
                    results.created++;
                } else {
                    results.skipped++;
                }

            } catch (err) {
                results.errors.push({
                    row: index + 2,
                    serial: row.warranty_serial_number,
                    error: err.message
                });
            }
        }

        if (results.created > 0) {
            const io = req.app.get('io');
            if (io) io.emit('warranties_bulk_updated', { created: results.created });
        }

        res.json({
            message: 'Proceso de carga masiva finalizado con éxito.',
            summary: results
        });

    } catch (error) {
        console.error('Error en bulkUploadWarranties:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar el archivo.' });
    }
};

// ============================================
// VALIDAR GARANTÍA (Endpoint para la APP)
// ============================================
exports.checkWarranty = async (req, res) => {
    try {
        const { serial } = req.params;
        const warranty = await Warranty.findOne({ where: { warranty_serial_number: serial } });

        if (!warranty) {
            return res.json({
                exists: false,
                message: 'No encontrado. Se requiere validación manual.'
            });
        }

        res.json({
            exists: true,
            purchase_date: warranty.warranty_purchase_date,
            status: warranty.warranty_status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};