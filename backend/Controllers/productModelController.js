// ============================================
// CONTROLADOR DE MODELOS DE PRODUCTO
// CRUD completo para los modelos asociados a
// cada producto. Sigue el mismo patrón que
// productController: include constante,
// findOrCreate en carga masiva (XLSX/CSV) y
// eventos Socket.io en cada operación de
// escritura para sincronizar el panel en tiempo
// real.
// ============================================

const ProductModel = require('../models/ProductModel');
const Product = require('../models/Product');
const XLSX = require('xlsx');
const Papa = require('papaparse');

// ============================================
// INCLUDE ESTÁNDAR DE RELACIONES
// Reutilizado en todas las consultas para
// devolver el producto junto con el modelo.
// ============================================
const MODEL_INCLUDE = [{ model: Product, as: 'product' }];

// ============================================
// OBTENER TODOS LOS MODELOS
// Incluye activos e inactivos ordenados por
// nombre para uso en el panel de administración.
// ============================================
exports.getAllProductsModels = async (req, res) => {
    try {
        const productModels = await ProductModel.findAll({
            include: MODEL_INCLUDE,
            order: [['product_model_name', 'ASC']],
        });
        res.json(productModels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER MODELO POR ID
// ============================================
exports.getAllProductsModelsById = async (req, res) => {
    try {
        const productModel = await ProductModel.findByPk(req.params.id, {
            include: MODEL_INCLUDE,
        });
        if (!productModel) return res.status(404).json({ error: 'Modelo no encontrado' });
        res.json(productModel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER MODELOS POR PRODUCTO
// Filtra todos los modelos activos e inactivos
// de un producto específico para la vista de
// detalle del producto.
// ============================================
exports.getProductsModelsByProductId = async (req, res) => {
    try {
        const productModels = await ProductModel.findAll({
            where: { product_id: req.params.product_id },
            include: MODEL_INCLUDE,
            order: [['product_model_name', 'ASC']],
        });
        res.json(productModels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER TODOS LOS MODELOS INACTIVOS
// Usados para mostrar el historial de elementos
// desactivados en las vistas de administración.
// ============================================
exports.getAllProductsModelsInactives = async (req, res) => {
    try {
        const productModels = await ProductModel.findAll({
            where: { product_model_status: false },
            include: MODEL_INCLUDE,
            order: [['product_model_name', 'ASC']],
        });
        res.json(productModels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR MODELO DE PRODUCTO
// Verifica que el producto exista antes de
// persistir. Devuelve el modelo con el producto
// ya cargado para que el frontend lo agregue
// a la lista sin recargar.
// Emite 'productModel_created'.
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
            product_model_status: product_model_status !== false,
        });

        const modelWithRelations = await ProductModel.findByPk(productModel.product_model_id, {
            include: MODEL_INCLUDE,
        });

        const io = req.app.get('io');
        if (io) io.emit('productModel_created', modelWithRelations);

        res.status(201).json(modelWithRelations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR MODELO DE PRODUCTO
// Verifica que el nuevo producto exista solo
// si se envió en el body. Usa ?? para conservar
// el valor actual en campos no enviados.
// Emite 'productModel_updated' con relaciones.
// ============================================
exports.updateProductModel = async (req, res) => {
    try {
        const productModel = await ProductModel.findByPk(req.params.id);
        if (!productModel) return res.status(404).json({ error: 'Modelo no encontrado' });

        const { product_id, product_model_name, product_model_status } = req.body;

        if (product_id) {
            const product = await Product.findByPk(product_id);
            if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await productModel.update({
            product_id: product_id ?? productModel.product_id,
            product_model_name: product_model_name || productModel.product_model_name,
            product_model_status: product_model_status !== undefined ? product_model_status : productModel.product_model_status,
        });

        const updatedModel = await ProductModel.findByPk(productModel.product_model_id, {
            include: MODEL_INCLUDE,
        });

        const io = req.app.get('io');
        if (io) io.emit('productModel_updated', updatedModel);

        res.json(updatedModel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR MODELO DE PRODUCTO
// Eliminación física. Emite 'productModel_deleted'
// con el ID para que el frontend retire la
// tarjeta sin recargar la lista.
// ============================================
exports.deleteProductModel = async (req, res) => {
    try {
        const productModel = await ProductModel.findByPk(req.params.id);
        if (!productModel) return res.status(404).json({ error: 'Modelo no encontrado' });

        const productModelId = productModel.product_model_id;
        await productModel.destroy();

        const io = req.app.get('io');
        if (io) io.emit('productModel_deleted', { product_model_id: productModelId });

        res.json({ message: 'Modelo eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CAMBIAR ESTADO DE UN MODELO (toggle)
// Invierte el estado activo/inactivo usando
// update() en lugar de save() para seguir el
// patrón estándar de Sequelize.
// Emite 'product_model_status_updated'.
// ============================================
exports.toggleProductModelStatus = async (req, res) => {
    try {
        const productModel = await ProductModel.findByPk(req.params.id);
        if (!productModel) return res.status(404).json({ error: 'Modelo del producto no encontrado' });

        await productModel.update({ product_model_status: !productModel.product_model_status });

        const io = req.app.get('io');
        if (io) io.emit('product_model_status_updated', {
            product_model_id: productModel.product_model_id,
            new_status: productModel.product_model_status,
        });

        res.json({
            message: 'Estado actualizado',
            product_model_name: productModel.product_model_name,
            new_status: productModel.product_model_status,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CARGA MASIVA DE MODELOS
// Acepta archivos Excel (.xlsx/.xls) y CSV.
// Pre-carga los IDs de productos válidos en un
// Set para validar sin consulta por fila.
// Usa findOrCreate para omitir duplicados sin
// lanzar error. Emite 'bulk_productModels_created'
// si se creó al menos un modelo nuevo.
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

        // Pre-cargar IDs de productos en un Set para validar sin consulta por fila
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
                    defaults: { product_model_status: modelStatus },
                });

                if (created) createdModels.push(model);
                else readModels.push(model);

            } catch (err) {
                errors.push({ row: index + 2, error: err.message });
            }
        }

        if (createdModels.length > 0) {
            const io = req.app.get('io');
            if (io) io.emit('bulk_productModels_created', { count: createdModels.length });
        }

        res.json({
            message: 'Proceso completado',
            summary: {
                total: data.length,
                creados: createdModels.length,
                existentes: readModels.length,
                errores: errors.length,
            },
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error) {
        res.status(500).json({ error: 'Error interno en el servidor' });
    }
};