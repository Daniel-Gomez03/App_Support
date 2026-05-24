// ============================================
// RUTAS: APP MÓVIL
// Todas las rutas bajo /mobile sirven a la app
// React Native. Se dividen en dos grupos:
//
// PÚBLICAS (sin token): accesibles sin sesión,
// usadas en el flujo de autenticación y para
// consultas previas al registro.
//
// PROTEGIDAS (mobileAuth): requieren el
// customer_id como Bearer token. mobileAuth
// valida que el cliente exista y esté activo.
//
// --- Públicas ---
// POST /mobile/login               → mobileLogin
// POST /mobile/register            → mobileRegister
// POST /mobile/forgot-password     → forgotPassword
// POST /mobile/reset-password      → resetPassword
// GET  /mobile/reset-redirect      → resetRedirect
// GET  /mobile/validate-warranty   → validateWarranty
// GET  /mobile/warranty-policy     → getWarrantyPolicy
//
// --- Protegidas ---
// GET   /mobile/faqs                             → getMobileFaqs
// PATCH /mobile/change-password                  → changeMobilePassword
// PATCH /mobile/profile                          → updateMobileProfile  + upload
// GET   /mobile/tickets/active                   → getMobileActiveTickets
// GET   /mobile/tickets/history                  → getMobileHistoryTickets
// GET   /mobile/tickets/:id                      → getMobileTicketDetail
// GET   /mobile/tickets/:id/comments             → getMobileTicketComments
// POST  /mobile/tickets/:id/comments             → addMobileTicketComment + upload (5)
// PATCH /mobile/tickets/:id/cancel               → requestTicketCancellation
// POST  /mobile/tickets/:id/rating               → submitRating
// GET   /mobile/categories                       → getMobileCategories
// GET   /mobile/categories/:category_id/products → getMobileProductsByCategory
// GET   /mobile/products/:product_id/models      → getMobileModelsByProduct
// POST  /mobile/tickets                          → createMobileTicket   + upload (5)
// ============================================

const express = require('express');
const router = express.Router();
const mobileController = require('../Controllers/mobileController');
const mobileAuth = require('../Middleware/mobileAuth');
const { upload } = require('../Middleware/ticketUpload');

// ============================================
// RUTAS PÚBLICAS (sin token)
// ============================================
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

// ============================================
// RUTAS PROTEGIDAS (requieren token de cliente)
// ============================================
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

router.post('/mobile/tickets/:id/rating',
    mobileAuth,
    mobileController.submitRating
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