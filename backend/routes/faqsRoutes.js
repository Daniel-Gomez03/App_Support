const express = require('express');
const router = express.Router();
const faqsController = require('../Controllers/faqsController');

router.get('/faqs', faqsController.getAllFaqs);
router.get('/faqs/inactives', faqsController.getAllFaqsInactives);
router.get('/faqs/:id', faqsController.getFaqById);


router.post('/faqs', faqsController.createFaq);
router.put('/faqs/:id', faqsController.updateFaq);
router.delete('/faqs/:id', faqsController.deleteFaq);
router.patch('/faqs/:id/toggle', faqsController.toggleFaqStatus);

module.exports = router;