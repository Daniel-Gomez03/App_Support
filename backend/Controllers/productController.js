const Product = require('../models/Product');
const Category = require('../models/Category');
const XLSX = require('xlsx');
const Papa = require('papaparse');

// ============================================
// OBTENER TODAS LOS PRODUCTOS
// ============================================
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Category, as: 'category' }]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER PRODUCTO POR ID
// ============================================
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: Category, as: 'category' }]
        });
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER TODOS LOS PRODUCTOS INACTIVOS
// ============================================
exports.getAllProductsInactives = async (req, res) => {
    try {
        const product = await Product.findAll({
            where: { product_status: false }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR UN PRODUCTO NUEVO
// ===========================================
exports.createProduct = async (req, res) => {
    try {
        const { category_id, product_name, product_status } = req.body;

        if (!category_id || !product_name) {
            return res.status(400).json({ error: 'Categoría y nombre son requeridos' });
        }

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
};

// ============================================
// ACTUALIZAR UN PRODUCTO
// ===========================================
exports.updateProduct = async (req, res) => {
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
};

// ============================================
// ELIMINAR UN PRODUCTO
// ===========================================
exports.deleteProduct = async (req, res) => {
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
};

// ============================================
// CAMBIAR DE ESTADO UN PRODUCTO
// ===========================================
exports.toggleProductStatus = async (req, res) => {
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
};

// ============================================
// CARGA MASIVA DE PRODUCTOS
// ===========================================
exports.bulkUploadProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó archivo o formato no válido' });
        }

        let data = [];
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            data = XLSX.utils.sheet_to_json(sheet);
        } else if (fileExtension === 'csv') {
            const csv = req.file.buffer.toString('utf-8');
            const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
            data = parsed.data;
        }

        if (data.length === 0) {
            return res.status(400).json({ error: 'El archivo está vacío' });
        }

        const requiredHeaders = ['category_id', 'product_name'];
        const fileHeaders = Object.keys(data[0]);
        const hasValidHeaders = requiredHeaders.every(h => fileHeaders.includes(h));

        if (!hasValidHeaders) {
            return res.status(400).json({
                error: 'Encabezados inválidos',
                required: requiredHeaders
            });
        }

        const allCategories = await Category.findAll({ attributes: ['category_id'] });
        const categoryIds = new Set(allCategories.map(c => c.category_id));

        const createdProducts = [];
        const readProducts = [];
        const errors = [];

        for (const [index, row] of data.entries()) {
            try {
                const { category_id, product_name, product_status } = row;

                if (!category_id || !product_name) {
                    errors.push({ row: index + 2, error: 'Datos incompletos' });
                    continue;
                }

                if (!categoryIds.has(Number(category_id))) {
                    errors.push({ row: index + 2, error: `Categoría ${category_id} no existe` });
                    continue;
                }

                let status = true;
                if (product_status !== undefined) {
                    const s = String(product_status).toLowerCase();
                    status = !(s === 'false' || s === '0' || s === 'no');
                }

                const [product, created] = await Product.findOrCreate({
                    where: { category_id, product_name },
                    defaults: { product_status: status }
                });

                if (created) {
                    createdProducts.push(product);
                } else {
                    readProducts.push(product);
                }

            } catch (err) {
                errors.push({ row: index + 2, error: err.message });
            }
        }

        if (createdProducts.length > 0) {
            const io = req.app.get('io');
            if (io) io.emit('bulk_products_created', { count: createdProducts.length });
        }

        res.json({
            message: `Proceso completado`,
            summary: {
                total: data.length,
                creados: createdProducts.length,
                existentes: readProducts.length,
                errores: errors.length
            },
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        res.status(500).json({ error: 'Error interno al procesar el archivo' });
    }
};