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