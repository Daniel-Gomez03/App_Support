// ============================================
// CONTROLADOR DE FAQS
// CRUD completo para las preguntas frecuentes.
// Cada FAQ está asociada a una categoría, un
// producto y opcionalmente a un modelo. Los
// enlaces de video se validan contra dominios
// de YouTube y Vimeo antes de persistir.
// Cada operación de escritura emite un evento
// Socket.io para sincronizar el panel en tiempo
// real sin recargar la vista.
// ============================================

const Faq = require('../models/Faqs');
const Category = require('../models/Category');
const Product = require('../models/Product');
const ProductModel = require('../models/ProductModel');

// ============================================
// INCLUDE ESTÁNDAR DE RELACIONES
// Reutilizado en todas las consultas para
// devolver categoría, producto y modelo junto
// con cada FAQ.
// ============================================
const FAQ_INCLUDE = [
    { model: Category, as: 'category' },
    { model: Product, as: 'product' },
    { model: ProductModel, as: 'product_model' },
];

// ============================================
// OBTENER TODAS LAS FAQS ACTIVAS
// Ordenadas por pregunta para una presentación
// consistente en la vista de administración.
// ============================================
exports.getAllFaqs = async (req, res) => {
    try {
        const faqs = await Faq.findAll({
            where: { faq_status: true },
            include: FAQ_INCLUDE,
            order: [['faq_question', 'ASC']],
        });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER TODAS LAS FAQS INACTIVAS
// Usadas para mostrar el historial de elementos
// desactivados en las vistas de administración.
// ============================================
exports.getAllFaqsInactives = async (req, res) => {
    try {
        const faqs = await Faq.findAll({
            where: { faq_status: false },
            include: FAQ_INCLUDE,
            order: [['faq_question', 'ASC']],
        });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// OBTENER FAQ POR ID
// ============================================
exports.getFaqById = async (req, res) => {
    try {
        const faq = await Faq.findByPk(req.params.id, { include: FAQ_INCLUDE });
        if (!faq) return res.status(404).json({ error: 'FAQ no encontrada' });
        res.json(faq);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CREAR UNA FAQ
// Valida campos obligatorios, longitud mínima
// de pregunta y respuesta, y que la URL de
// video sea de YouTube o Vimeo. Verifica que
// la categoría y el producto existan en
// paralelo para reducir round-trips a la BD.
// Emite 'faq_created' con las relaciones ya
// cargadas para que el panel agregue la tarjeta
// sin recargar la lista completa.
// ============================================
exports.createFaq = async (req, res) => {
    try {
        const { category_id, product_id, product_model_id, faq_question, faq_answer, faq_video_url } = req.body;

        const cleanQuestion = faq_question?.trim();
        const cleanAnswer = faq_answer?.trim();
        const cleanVideoUrl = faq_video_url?.trim();

        if (!category_id || !product_id || !cleanQuestion || !cleanAnswer || !cleanVideoUrl) {
            return res.status(422).json({
                error: 'Todos los campos son requeridos y no pueden contener solo espacios en blanco.'
            });
        }

        if (cleanQuestion.length < 10) {
            return res.status(422).json({ error: 'El asunto (pregunta) debe tener al menos 10 caracteres.' });
        }
        if (cleanAnswer.length < 20) {
            return res.status(422).json({ error: 'La problemática (instrucciones) debe tener al menos 20 caracteres.' });
        }

        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\//;

        if (!youtubeRegex.test(cleanVideoUrl) && !vimeoRegex.test(cleanVideoUrl)) {
            return res.status(422).json({ error: 'Solo se aceptan enlaces válidos de YouTube o Vimeo.' });
        }

        // Verificar existencia de categoría y producto en paralelo
        const [category, product] = await Promise.all([
            Category.findByPk(category_id),
            Product.findByPk(product_id),
        ]);

        if (!category || !product) {
            return res.status(404).json({ error: 'La categoría o el producto seleccionados no existen.' });
        }

        if (product_model_id) {
            const productModel = await ProductModel.findByPk(product_model_id);
            if (!productModel) {
                return res.status(404).json({ error: 'El modelo seleccionado no existe.' });
            }
        }

        const faq = await Faq.create({
            category_id,
            product_id,
            product_model_id: product_model_id || null,
            faq_question: cleanQuestion,
            faq_answer: cleanAnswer,
            faq_video_url: cleanVideoUrl,
            faq_status: true,
        });

        const faqWithRelations = await Faq.findByPk(faq.faq_id, { include: FAQ_INCLUDE });

        const io = req.app.get('io');
        if (io) io.emit('faq_created', faqWithRelations);

        res.status(201).json(faqWithRelations);

    } catch (error) {
        console.error("Error en createFaq:", error);
        res.status(500).json({ error: 'Ocurrió un error interno al crear la FAQ.' });
    }
};

// ============================================
// ACTUALIZAR UNA FAQ
// Aplica las mismas validaciones que el alta.
// Emite 'faq_updated' con las relaciones para
// que el panel reemplace la tarjeta existente.
// ============================================
exports.updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, product_id, product_model_id, faq_question, faq_answer, faq_video_url } = req.body;

        const cleanQuestion = faq_question?.trim();
        const cleanAnswer = faq_answer?.trim();
        const cleanVideoUrl = faq_video_url?.trim();

        if (!category_id || !product_id || !cleanQuestion || !cleanAnswer || !cleanVideoUrl) {
            return res.status(422).json({ error: 'Todos los campos son obligatorios para actualizar.' });
        }

        if (cleanQuestion.length < 10) {
            return res.status(422).json({ error: 'El asunto debe tener al menos 10 caracteres.' });
        }
        if (cleanAnswer.length < 20) {
            return res.status(422).json({ error: 'La problemática debe tener al menos 20 caracteres.' });
        }

        const faq = await Faq.findByPk(id);
        if (!faq) return res.status(404).json({ error: 'FAQ no encontrada.' });

        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\//;

        if (!youtubeRegex.test(cleanVideoUrl) && !vimeoRegex.test(cleanVideoUrl)) {
            return res.status(422).json({ error: 'El enlace de video no es válido (use YouTube o Vimeo).' });
        }

        await faq.update({
            category_id,
            product_id,
            product_model_id: product_model_id || null,
            faq_question: cleanQuestion,
            faq_answer: cleanAnswer,
            faq_video_url: cleanVideoUrl,
        });

        const faqWithRelations = await Faq.findByPk(id, { include: FAQ_INCLUDE });

        const io = req.app.get('io');
        if (io) io.emit('faq_updated', faqWithRelations);

        res.json(faqWithRelations);

    } catch (error) {
        console.error("Error en updateFaq:", error);
        res.status(500).json({ error: 'Ocurrió un error interno al actualizar la FAQ.' });
    }
};

// ============================================
// ELIMINAR UNA FAQ
// Eliminación física. Emite 'faq_deleted' con
// el ID para que el panel retire la tarjeta
// sin recargar la lista completa.
// ============================================
exports.deleteFaq = async (req, res) => {
    try {
        const faq = await Faq.findByPk(req.params.id);
        if (!faq) return res.status(404).json({ error: 'FAQ no encontrada' });

        const faqId = faq.faq_id;
        await faq.destroy();

        const io = req.app.get('io');
        if (io) io.emit('faq_deleted', { faq_id: faqId });

        res.json({ message: 'FAQ eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// CAMBIAR ESTADO DE UNA FAQ (toggle)
// Invierte el estado activo/inactivo usando
// update() en lugar de save() para seguir el
// patrón estándar de Sequelize.
// Emite 'faq_toggled' con el nuevo estado.
// ============================================
exports.toggleFaqStatus = async (req, res) => {
    try {
        const faq = await Faq.findByPk(req.params.id);
        if (!faq) return res.status(404).json({ error: 'FAQ no encontrada' });

        await faq.update({ faq_status: !faq.faq_status });

        const io = req.app.get('io');
        if (io) io.emit('faq_toggled', { faq_id: faq.faq_id, new_status: faq.faq_status });

        res.json({
            message: 'Estado actualizado',
            faq_question: faq.faq_question,
            new_status: faq.faq_status,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};