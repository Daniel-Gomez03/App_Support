const ProductModel = require('../models/ProductModel')
const Product = require('../models/Product');
const XLSX = require('xlsx');
const Papa = require('papaparse');

// ============================================
// OBTENER TODOS LOS MODELOS DE LOS PRODUCTOS
// ============================================
exports.getAllProductsModels = async (req, res) => {
    try {
        const productModels = await ProductModel.findAll({
            include: [{ model: Product, as: 'product' }]
        });
        res.json(productModels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================================================
// OBTENER TODOS LOS MODELOS DE LOS PRODUCTOS POR ID
// ==================================================
exports.getAllProductsModelsById = async (req, res) => {
    try {
        const productModels = await ProductModel.findAll({
            include: [{ model: Product, as: 'product' }]
        });
        res.json(productModels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER MODELOS POR PRODUCTO
// ============================================
exports.getProductsModelsByProductId = async (req, res) => {
    try {
        const productModels = await ProductModel.findAll({
            where: { product_id: req.params.product_id },
            include: [{ model: Product, as: 'product' }]
        });
        res.json(productModels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ====================================================
// OBTENER TODOS LOS MODELOS DE LOS PRODUCTOS INACTIVOS
// ====================================================
exports.getAllProductsModelsInactives = async (req, res) => {
    try {
        const productModels = await ProductModel.findAll({
            where: { product_model_status: false },
            include: [{ model: Product, as: 'product' }]
        });
        res.json(productModels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR UN NUEVO MODELO DE PRODUCTO
// ============================================
exports.createProductModel = async (req, res) => {
    try {
        const { product_id, product_model_name, product_model_status } = req.body;

        if (!product_id || !product_model_name) {
            return res.status(400).json({ error: 'Producto y nombre del modelo son requeridos' });
        }

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
};

// ============================================
// ACTUALIZAR MODELO DE PRODUCTO
// ============================================
exports.updateProductModel = async (req, res) => {
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
};

// ============================================
// ELIMINAR MODELO DE PRODUCTO
// ============================================
exports.deleteProductModel = async (req, res) => {
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
};

// ============================================
// CAMBIAR DE ESTADO MODELO DE PRODUCTO
// ============================================
exports.toggleProductModelStatus = async (req, res) => {
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
};

// ============================================
// CARGA MASIVA DE MODELOS DE PRODUCTOS
// ============================================
exports.bulkUploadProductsModels = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se proporcionó archivo' });

        let data = [];
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else if (fileExtension === 'csv') {
            const csv = req.file.buffer.toString('utf-8');
            const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
            data = parsed.data;
        }

        if (data.length === 0) return res.status(400).json({ error: 'El archivo está vacío' });

        const requiredHeaders = ['product_id', 'product_model_name'];
        const fileHeaders = Object.keys(data[0]);
        const hasValidHeaders = requiredHeaders.every(h => fileHeaders.includes(h));

        if (!hasValidHeaders) {
            return res.status(400).json({ error: 'Encabezados inválidos', required: requiredHeaders });
        }

        const allProducts = await Product.findAll({ attributes: ['product_id'] });
        const productIds = new Set(allProducts.map(p => p.product_id));

        const createdModels = [];
        const readModels = [];
        const errors = [];

        for (const [index, row] of data.entries()) {
            try {
                const { product_id, product_model_name, product_model_status } = row;

                if (!product_id || !product_model_name) {
                    errors.push({ row: index + 2, error: 'Datos incompletos' });
                    continue;
                }

                if (!productIds.has(Number(product_id))) {
                    errors.push({ row: index + 2, error: `El producto con ID ${product_id} no existe` });
                    continue;
                }

                let modelStatus = true;
                if (product_model_status !== undefined) {
                    const statusStr = String(product_model_status).toLowerCase();
                    modelStatus = !(statusStr === 'false' || statusStr === '0' || statusStr === 'no');
                }

                const [model, created] = await ProductModel.findOrCreate({
                    where: { product_id, product_model_name },
                    defaults: { product_model_status: modelStatus }
                });

                if (created) {
                    createdModels.push(model);
                } else {
                    readModels.push(model);
                }
            } catch (error) {
                errors.push({ row: index + 2, error: error.message });
            }
        }

        res.json({
            message: 'Proceso completado',
            summary: {
                total: data.length,
                creados: createdModels.length,
                existentes: readModels.length,
                errores: errors.length
            },
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        res.status(500).json({ error: 'Error interno en el servidor' });
    }
};