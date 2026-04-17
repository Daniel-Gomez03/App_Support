const Warranty = require('../models/Warranty');
const XLSX = require('xlsx');
const Papa = require('papaparse');

/**
 * Formatea la fecha para MySQL asegurando que no haya saltos de día.
 * Forzamos las 12:00:00 para evitar que el timezone reste horas y cambie el día.
 */
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
// CREAR UNA NUEVA GARANTÍA 
// ============================================
exports.createWarranty = async (req, res) => {
    try {
        let { warranty_serial_number, warranty_invoice_number, warranty_purchase_date } = req.body;

        // --- VALIDACIONES DE SEGURIDAD ---
        if (!warranty_serial_number || warranty_serial_number.trim().length < 16) {
            return res.status(400).json({ error: 'El número de serie debe tener al menos 16 caracteres' });
        }
        if (!warranty_invoice_number || warranty_invoice_number.trim().length < 4) {
            return res.status(400).json({ error: 'El número de factura debe tener al menos 4 caracteres' });
        }
        if (!warranty_purchase_date) {
            return res.status(400).json({ error: 'La fecha de compra es obligatoria' });
        }

        // --- VALIDACIÓN DE RANGO DE FECHAS ---
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

        const formattedDate = formatToMySQLDate(warranty_purchase_date);

        const warranty = await Warranty.create({
            warranty_serial_number: warranty_serial_number.trim(),
            warranty_invoice_number: warranty_invoice_number.trim(),
            warranty_purchase_date: formattedDate,
            warranty_status: true
        });

        const io = req.app.get('io');
        if (io) io.emit('warranty_created', warranty);

        res.status(201).json(warranty);

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'El número de serie o el número de factura ya existen en el sistema'
            });
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
        let { warranty_serial_number, warranty_invoice_number, warranty_purchase_date } = req.body;

        const warranty = await Warranty.findByPk(id);
        if (!warranty) return res.status(404).json({ error: 'Garantía no encontrada' });

        // Validaciones si se intentan actualizar estos campos
        if (warranty_serial_number && warranty_serial_number.trim().length < 16) {
            return res.status(400).json({ error: 'El serial debe tener al menos 16 caracteres' });
        }

        let updateData = {
            warranty_serial_number: warranty_serial_number?.trim(),
            warranty_invoice_number: warranty_invoice_number?.trim()
        };

        if (warranty_purchase_date) {
            updateData.warranty_purchase_date = formatToMySQLDate(warranty_purchase_date);
        }

        await warranty.update(updateData);

        res.json({ message: 'Garantía actualizada con éxito', warranty });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'El serial o la factura ya están registrados' });
        }
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
        res.json({ message: 'Estado actualizado', warranty_status: nuevoEstado });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// ============================================
// CARGA MASIVA DE GARANTÍAS 
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
                let { warranty_serial_number, warranty_invoice_number, warranty_purchase_date } = row;

                const serial = String(warranty_serial_number || '').trim();
                const invoice = String(warranty_invoice_number || '').trim();

                // --- VALIDACIONES MASIVAS ---
                if (serial.length < 16) throw new Error(`S/N insuficiente (Mín. 16).`);
                if (invoice.length < 4) throw new Error(`Factura insuficiente (Mín. 4).`);

                let finalDate;
                if (typeof warranty_purchase_date === 'number') {
                    const dateObj = XLSX.SSF.parse_date_code(warranty_purchase_date);
                    finalDate = new Date(dateObj.y, dateObj.m - 1, dateObj.d, 12, 0, 0);
                } else {
                    const dateParts = String(warranty_purchase_date).split(/[-/]/);
                    if (dateParts.length === 3) {
                        if (dateParts[0].length === 4) { // YYYY-MM-DD
                            finalDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0);
                        } else { // DD-MM-YYYY
                            finalDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], 12, 0, 0);
                        }
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

                const [item, created] = await Warranty.findOrCreate({
                    where: { warranty_serial_number: serial },
                    defaults: {
                        warranty_invoice_number: invoice,
                        warranty_purchase_date: formattedPurchaseDate,
                        warranty_status: true
                    }
                });

                if (created) results.created++;
                else results.skipped++;

            } catch (err) {
                results.errors.push({
                    row: rowNumber,
                    serial: row.warranty_serial_number || 'N/A',
                    error: err.message
                });
            }
        }

        if (results.created > 0) {
            const io = req.app.get('io');
            if (io) io.emit('warranties_bulk_updated', { created: results.created });
        }

        res.json({ message: 'Proceso finalizado.', summary: results });

    } catch (error) {
        console.error("Bulk Upload Error:", error);
        res.status(500).json({ error: 'Error interno en la carga masiva.' });
    }
};