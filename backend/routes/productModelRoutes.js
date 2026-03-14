const express = require('express');
const router = express.Router();
const ProductModel = require('../models/ProductModel');
const Product = require('../models/Product');
const multer = require('multer');
const XLSX = require('xlsx');
const Papa = require('papaparse');
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls) o CSV'));
        }
    }
});

// Obtener todos los modelos
router.get('/product-models', async (req, res) => {
    try {
        const productModels = await ProductModel.findAll({
            include: [{ model: Product, as: 'product' }]
        });
        res.json(productModels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener modelo por ID
router.get('/product-models/:id', async (req, res) => {
    try {
        const productModel = await ProductModel.findByPk(req.params.id, {
            include: [{ model: Product, as: 'product' }]
        });
        if (!productModel) return res.status(404).json({ error: 'Modelo no encontrado' });
        res.json(productModel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener modelos por producto
router.get('/products/:product_id/models', async (req, res) => {
    try {
        const productModels = await ProductModel.findAll({
            where: { product_id: req.params.product_id },
            include: [{ model: Product, as: 'product' }]
        });
        res.json(productModels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear modelo
router.post('/product-models', async (req, res) => {
    try {
        const { product_id, product_model_name, product_model_status } = req.body;

        if (!product_id || !product_model_name) {
            return res.status(400).json({ error: 'Producto y nombre del modelo son requeridos' });
        }

        // Verificar que el producto existe
        const product = await Product.findByPk(product_id);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

        const productModel = await ProductModel.create({
            product_id,
            product_model_name,
            product_model_status: product_model_status !== false
        });

        const modelWithRelations = await ProductModel.findByPk(productModel.product_model_id, {
            include: [{ model: Product, as: 'product' }]
        });

        const io = req.app.get('io');
        io.emit('productModel_created', modelWithRelations);

        res.status(201).json(modelWithRelations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar modelo
router.put('/product-models/:id', async (req, res) => {
    try {
        const productModel = await ProductModel.findByPk(req.params.id);
        if (!productModel) return res.status(404).json({ 
            error: 'Modelo no encontrado' 
        });

        const { product_id, product_model_name, product_model_status } = req.body;

        if (product_id) {
            const product = await Product.findByPk(product_id);
            if (!product) return res.status(404).json({ 
                error: 'Producto no encontrado' 
            });
        }

        await productModel.update({
            product_id: product_id || productModel.product_id,
            product_model_name: product_model_name || productModel.product_model_name,
            product_model_status: product_model_status !== undefined ? product_model_status : productModel.product_model_status
        });

        const updatedModel = await ProductModel.findByPk(productModel.product_model_id, {
            include: [{ model: Product, as: 'product' }]
        });

        const io = req.app.get('io');
        io.emit('productModel_updated', updatedModel);

        res.json(updatedModel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar modelo
router.delete('/product-models/:id', async (req, res) => {
    try {
        const productModel = await ProductModel.findByPk(req.params.id);
        if (!productModel) return res.status(404).json({ 
            error: 'Modelo no encontrado' 
        });

        const productModelId = productModel.product_model_id;
        await productModel.destroy();

        const io = req.app.get('io');
        io.emit('productModel_deleted', {
            product_model_id: productModelId
        });

        res.json({ message: 'Modelo eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Cambiar estado del modelo del producto
router.patch('/product-models/:id/toggle', async (req, res) => {
    try {
        const productModel = await ProductModel.findByPk(req.params.id);
        if (!productModel) return res.status(404).json({ error: 'Modelo del producto no encontrado' });

        productModel.product_model_status = !productModel.product_model_status; 
        await productModel.save();

        const io = req.app.get('io');
        io.emit('product_model_status_updated', {
            product_model_id: productModel.product_model_id,
            new_status: productModel.product_model_status
        });

        res.json({
            message: 'Estado actualizado',
            product_model_name: productModel.product_model_name,
            new_status: productModel.product_model_status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Cargar modelos masivamente desde Excel/CSV
router.post('/product-models/bulk-upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó archivo' });
        }

        let data = [];
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(sheet);
        }
        else if (fileExtension === 'csv') {
            const csv = req.file.buffer.toString('utf-8');
            const parsed = Papa.parse(csv, { header: true });
            data = parsed.data.filter(row => Object.values(row).some(v => v));
        }

        if (data.length === 0) {
            return res.status(400).json({ error: 'El archivo está vacío' });
        }

        const requiredHeaders = ['product_id', 'product_model_name', 'product_model_status'];
        const fileHeaders = Object.keys(data[0]);
        const hasValidHeaders = requiredHeaders.every(header => fileHeaders.includes(header));

        if (!hasValidHeaders) {
            return res.status(400).json({
                error: 'Encabezados inválidos',
                required: requiredHeaders,
                found: fileHeaders
            });
        }

        const rowsData = data.slice(1);
        const validRows = [];
        const invalidRows = [];

        rowsData.forEach((row, index) => {
            if (!row.product_id || !row.product_model_name) {
                invalidRows.push({
                    row: index + 3,
                    error: 'product_id y product_model_name son requeridos'
                });
            } else {
                validRows.push(row);
            }
        });

        if (invalidRows.length > 0) {
            return res.status(400).json({
                error: 'Hay filas con datos inválidos',
                details: invalidRows
            });
        }

        const createdModels = [];
        const readModels = [];
        const errors = [];

        for (const row of validRows) {
            try {
                const product = await Product.findByPk(row.product_id);
                if (!product) {
                    errors.push({
                        product_model_name: row.product_model_name,
                        error: `Producto con ID ${row.product_id} no existe`
                    });
                    continue;
                }

                let modelStatus = true;
                if (row.product_model_status) {
                    const statusStr = String(row.product_model_status).toLowerCase();
                    modelStatus = statusStr !== 'false' && statusStr !== '0' && statusStr !== 'no';
                }

                const existingModel = await ProductModel.findOne({
                    where: {
                        product_id: row.product_id,
                        product_model_name: row.product_model_name
                    }
                });

                if (existingModel) {
                    readModels.push({
                        product_model_id: existingModel.product_model_id,
                        product_model_name: existingModel.product_model_name,
                        product_id: existingModel.product_id,
                        product_model_status: existingModel.product_model_status,
                        status: 'existente'
                    });
                } else {
                    const productModel = await ProductModel.create({
                        product_id: row.product_id,
                        product_model_name: row.product_model_name,
                        product_model_status: modelStatus
                    });

                    createdModels.push({
                        product_model_id: productModel.product_model_id,
                        product_model_name: productModel.product_model_name,
                        product_id: productModel.product_id,
                        product_model_status: productModel.product_model_status,
                        status: 'creado'
                    });
                }
            } catch (error) {
                errors.push({
                    product_model_name: row.product_model_name,
                    error: error.message
                });
            }
        }

        res.json({
            message: `Proceso completado`,
            summary: {
                creados: createdModels.length,
                leidos: readModels.length,
                errores: errors.length
            },
            created: createdModels.length > 0 ? createdModels : undefined,
            read: readModels.length > 0 ? readModels : undefined,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;