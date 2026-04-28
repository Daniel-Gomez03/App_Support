const express = require('express');
const router = express.Router();
const mobileController = require('../Controllers/mobileController');
const mobileAuth = require('../Middleware/mobileAuth');
const { upload } = require('../Middleware/ticketUpload');

// Rutas públicas (sin token)
router.post('/mobile/login',
    mobileController.mobileLogin
);

router.post('/mobile/register',
    mobileController.mobileRegister
);

router.post('/mobile/forgot-password',
    mobileController.forgotPassword
);

router.post('/mobile/reset-password',
    mobileController.resetPassword
);

router.get('/mobile/reset-redirect',
    mobileController.resetRedirect
);

router.get('/mobile/validate-warranty',
    mobileController.validateWarranty
);

router.get('/mobile/warranty-policy',
    mobileController.getWarrantyPolicy
);

// Rutas protegidas (requieren token de cliente)
router.get('/mobile/faqs',
    mobileAuth,
    mobileController.getMobileFaqs
);

router.patch('/mobile/change-password',
    mobileAuth,
    mobileController.changeMobilePassword
);

router.patch('/mobile/profile',
    mobileAuth,
    upload.single('image'),
    mobileController.updateMobileProfile
);

router.get('/mobile/tickets/active',
    mobileAuth,
    mobileController.getMobileActiveTickets
);
router.get('/mobile/tickets/history',
    mobileAuth,
    mobileController.getMobileHistoryTickets
);
router.get('/mobile/tickets/:id',
    mobileAuth,
    mobileController.getMobileTicketDetail
);
router.get('/mobile/tickets/:id/comments',
    mobileAuth,
    mobileController.getMobileTicketComments
);
router.post('/mobile/tickets/:id/comments',
    mobileAuth,
    upload.array('attachments', 5),
    mobileController.addMobileTicketComment
);
router.patch('/mobile/tickets/:id/cancel',
    mobileAuth,
    mobileController.requestTicketCancellation
);

router.get('/mobile/categories',
    mobileAuth,
    mobileController.getMobileCategories
);

router.get('/mobile/categories/:category_id/products',
    mobileAuth, 
    mobileController.getMobileProductsByCategory
);

router.get('/mobile/products/:product_id/models',
    mobileAuth, 
    mobileController.getMobileModelsByProduct
);

router.post('/mobile/tickets',
    mobileAuth,
    upload.array('evidences', 5),
    mobileController.createMobileTicket
);

module.exports = router;