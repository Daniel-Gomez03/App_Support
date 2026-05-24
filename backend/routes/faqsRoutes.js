// ============================================
// RUTAS: PREGUNTAS FRECUENTES (FAQs)
// CRUD completo para el catálogo de FAQs del
// módulo Q&A. Incluye un endpoint separado
// para listar las FAQs inactivas, ya que estas
// no aparecen en la app pero deben ser visibles
// en el panel para gestión.
//
// GET    /faqs              → getAllFaqs          (read)
// GET    /faqs/inactives    → getAllFaqsInactives (read)
// GET    /faqs/:id          → getFaqById          (read)
// POST   /faqs              → createFaq           (write)
// PUT    /faqs/:id          → updateFaq           (edit)
// DELETE /faqs/:id          → deleteFaq           (edit)
// PATCH  /faqs/:id/toggle   → toggleFaqStatus     (edit)
// ============================================

const express = require('express');
const router = express.Router();
const faqsController = require('../Controllers/faqsController');
const authorize = require('../Middleware/authorize');

router.get('/faqs',
    authorize('Q&A', 'permissions_read'),
    faqsController.getAllFaqs
);

router.get('/faqs/inactives',
    authorize('Q&A', 'permissions_read'),
    faqsController.getAllFaqsInactives
);

router.get('/faqs/:id',
    authorize('Q&A', 'permissions_read'),
    faqsController.getFaqById
);

router.post('/faqs',
    authorize('Q&A', 'permissions_write'),
    faqsController.createFaq
);

router.put('/faqs/:id',
    authorize('Q&A', 'permissions_edit'),
    faqsController.updateFaq
);

router.delete('/faqs/:id',
    authorize('Q&A', 'permissions_edit'),
    faqsController.deleteFaq
);

router.patch('/faqs/:id/toggle',
    authorize('Q&A', 'permissions_edit'),
    faqsController.toggleFaqStatus
);

module.exports = router;