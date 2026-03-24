const Faq = require('../models/Faqs');
const Category = require('../models/Category');
const Product = require('../models/Product');
const ProductModel = require('../models/ProductModel')

// ============================================
// OBTENER TODOS LAS FAQS ACTIVAS
// ============================================
exports.getAllFaqs = async (req, res) => {
    try {
        const faqs = await Faq.findAll({
            where: { faq_status: true },
            include: [
                { model: Category, as: 'category' },
                { model: Product, as: 'product' },
                { model: ProductModel, as: 'product_model' }
            ]
        });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER TODOS LAS FAQS INACTIVAS
// ============================================
exports.getAllFaqsInactives = async (req, res) => {
    try {
        const faqs = await Faq.findAll({
            where: { faq_status: false },
            include: [
                { model: Category, as: 'category' },
                { model: Product, as: 'product' },
                { model: ProductModel, as: 'product_model' }
            ]
        });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER TODOS FAQ POR ID
// ============================================
exports.getFaqById = async (req, res) => {
    try {
        const faq = await Faq.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'category' },
                { model: Product, as: 'product' },
                { model: ProductModel, as: 'product_model' }
            ]
        });
        if (!faq) return res.status(404).json({ error: 'FAQ no encontrada' });
        res.json(faq);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR UNA FAQ
// ============================================
exports.createFaq = async (req, res) => {
    try {
        const { category_id, product_id, product_model_id, faq_question, faq_answer, faq_video_url } = req.body;

        if (!category_id || !product_id || !faq_question || !faq_answer || !faq_video_url) {
            return res.status(422).json({ error: 'Todos los campos son requeridos' });
        }

        const category = await Category.findByPk(category_id);
        const product = await Product.findByPk(product_id);

        if (!category || !product) {
            return res.status(404).json({ error: 'Categoría o producto no encontrado' });
        }

        if (product_model_id) {
            const productModel = await ProductModel.findByPk(product_model_id);
            if (!productModel) {
                return res.status(404).json({ error: 'Modelo no encontrado' });
            }
        }

        if (faq_video_url) {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
            const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\//;

            if (!youtubeRegex.test(faq_video_url) && !vimeoRegex.test(faq_video_url)) {  // ✅ CORRECTO
                return res.status(422).json({ error: 'Solo se aceptan enlaces de YouTube o Vimeo' });
            }
        }

        const faq = await Faq.create({
            category_id,
            product_id,
            product_model_id: product_model_id || null,
            faq_question,
            faq_answer,
            faq_video_url,
            faq_status: true
        });

        const faqWithRelations = await Faq.findByPk(faq.faq_id, {
            include: [
                { model: Category, as: 'category' },
                { model: Product, as: 'product' },
                { model: ProductModel, as: 'product_model' }
            ]
        });

        const io = req.app.get('io');
        io.emit('faq_created', faqWithRelations);

        res.status(201).json(faqWithRelations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ACTUALIZAR UNA FAQ
// ============================================
exports.updateFaq = async (req, res) => {
    try {
        const { category_id, product_id, product_model_id, faq_question, faq_answer, faq_video_url } = req.body;

        if (!category_id || !product_id || !faq_question || !faq_answer || !faq_video_url) {
            return res.status(422).json({ error: 'Todos los campos son requeridos' });
        }

        const faq = await Faq.findByPk(req.params.id);
        if (!faq) return res.status(404).json({ error: 'FAQ no encontrada' });

        const category = await Category.findByPk(category_id);
        const product = await Product.findByPk(product_id);

        if (!category || !product) {
            return res.status(404).json({ error: 'Categoría o producto no encontrado' });
        }

        if (product_model_id) {
            const productModel = await ProductModel.findByPk(product_model_id);
            if (!productModel) {
                return res.status(404).json({ error: 'Modelo no encontrado' });
            }
        }

        if (faq_video_url) {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
            const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\//;

            if (!youtubeRegex.test(faq_video_url) && !vimeoRegex.test(faq_video_url)) {  // ✅ CORRECTO
                return res.status(422).json({ error: 'Solo se aceptan enlaces de YouTube o Vimeo' });
            }
        }

        await faq.update({
            category_id,
            product_id,
            product_model_id: product_model_id || null,
            faq_question,
            faq_answer,
            faq_video_url
        });

        const faqWithRelations = await Faq.findByPk(faq.faq_id, {
            include: [
                { model: Category, as: 'category' },
                { model: Product, as: 'product' },
                { model: ProductModel, as: 'product_model' }
            ]
        });

        const io = req.app.get('io');
        io.emit('faq_updated', faqWithRelations);

        res.json(faqWithRelations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// ELIMINAR UNA FAQ
// ============================================
exports.deleteFaq = async (req, res) => {
    try {
        const faq = await Faq.findByPk(req.params.id);
        if (!faq) return res.status(404).json({ error: 'FAQ no encontrada' });

        const faqId = faq.faq_id;
        await faq.destroy();

        const io = req.app.get('io');
        io.emit('faq_deleted', { faq_id: faqId });

        res.json({ message: 'FAQ eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CAMBIAR DE ESTADO UNA FAQ
// ============================================
exports.toggleFaqStatus = async (req, res) => {
    try {
        const faq = await Faq.findByPk(req.params.id);
        if (!faq) return res.status(404).json({ error: 'FAQ no encontrada' });

        faq.faq_status = !faq.faq_status;
        await faq.save();

        const io = req.app.get('io');
        io.emit('faq_toggled', {
            faq_id: faq.faq_id,
            new_status: faq.faq_status
        });

        res.json({
            message: 'Estado actualizado',
            faq_question: faq.faq_question,
            new_status: faq.faq_status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};