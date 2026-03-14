const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const multer = require('multer');
const XLSX = require('xlsx');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
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

// Obtener todos los productos
router.get('/products', async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Category, as: 'category' }]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener producto por ID
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: Category, as: 'category' }]
        });
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear producto
router.post('/products', async (req, res) => {
    try {
        const { category_id, product_name, product_status } = req.body;

        if (!category_id || !product_name) {
            return res.status(400).json({ error: 'Categoría y nombre son requeridos' });
        }

        // Verificar que la categoría existe
        const category = await Category.findByPk(category_id);
        if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

        const product = await Product.create({
            category_id,
            product_name,
            product_status: product_status !== false
        });

        const productWithRelations = await Product.findByPk(product.product_id, {
            include: [{ model: Category, as: 'category' }]
        });

        const io = req.app.get('io');
        io.emit('product_created', productWithRelations);

        res.status(201).json(productWithRelations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar producto
router.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

        const { category_id, product_name, product_status } = req.body;

        if (category_id) {
            const category = await Category.findByPk(category_id);
            if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        await product.update({
            category_id: category_id || product.category_id,
            product_name: product_name || product.product_name,
            product_status: product_status !== undefined ? product_status : product.product_status
        });

        const updatedProduct = await Product.findByPk(product.product_id, {
            include: [{ model: Category, as: 'category' }]
        });

        const io = req.app.get('io');
        io.emit('product_updated', updatedProduct);

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar producto
router.delete('/products/:id', async (req, res) => {
     try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ 
            error: 'Producto no encontrado' 
        });  

        const productId = product.product_id; 
        await product.destroy();

        const io = req.app.get('io');
        io.emit('product_deleted', {
            product_id: productId
        });

        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Cambiar estado del producto
router.patch('/products/:id/toggle', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

        product.product_status = !product.product_status; 
        await product.save();

        const io = req.app.get('io');
        io.emit('product_status_updated', {
            product_id: product.product_id,
            new_status: product.product_status
        });

        res.json({
            message: 'Estado actualizado',
            product_name: product.product_name,
            new_status: product.product_status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cargar productos masivamente desde Excel/CSV
router.post('/products/bulk-upload', upload.single('file'), async (req, res) => {
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

        const requiredHeaders = ['category_id', 'product_name', 'product_status'];
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
            if (!row.category_id || !row.product_name) {
                invalidRows.push({
                    row: index + 3,
                    error: 'category_id y product_name son requeridos'
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

        const createdProducts = [];
        const readProducts = [];
        const errors = [];

        for (const row of validRows) {
            try {
                const category = await Category.findByPk(row.category_id);
                if (!category) {
                    errors.push({
                        product_name: row.product_name,
                        error: `Categoría con ID ${row.category_id} no existe`
                    });
                    continue;
                }

                let productStatus = true;
                if (row.product_status) {
                    const statusStr = String(row.product_status).toLowerCase();
                    productStatus = statusStr !== 'false' && statusStr !== '0' && statusStr !== 'no';
                }

                const existingProduct = await Product.findOne({
                    where: {
                        category_id: row.category_id,
                        product_name: row.product_name
                    }
                });

                if (existingProduct) {
                    readProducts.push({
                        product_id: existingProduct.product_id,
                        product_name: existingProduct.product_name,
                        category_id: existingProduct.category_id,
                        product_status: existingProduct.product_status,
                        status: 'existente'
                    });
                } else {
                    const product = await Product.create({
                        category_id: row.category_id,
                        product_name: row.product_name,
                        product_status: productStatus
                    });

                    createdProducts.push({
                        product_id: product.product_id,
                        product_name: product.product_name,
                        category_id: product.category_id,
                        product_status: product.product_status,
                        status: 'creado'
                    });
                }
            } catch (error) {
                errors.push({
                    product_name: row.product_name,
                    error: error.message
                });
            }
        }

        res.json({
            message: `Proceso completado`,
            summary: {
                creados: createdProducts.length,
                leidos: readProducts.length,
                errores: errors.length
            },
            created: createdProducts.length > 0 ? createdProducts : undefined,
            read: readProducts.length > 0 ? readProducts : undefined,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;