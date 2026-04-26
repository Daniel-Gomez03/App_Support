const express = require('express');
const router = express.Router();
const warrantyController = require('../Controllers/warrantyController');
const upload = require('../Middleware/upload');
const authorize = require('../Middleware/authorize');

// ── Rutas fijas (deben ir ANTES de las rutas con :id) ────────────────────────

router.get('/warranty',
    authorize('Garantias', 'permissions_read'),
    warrantyController.getAllWarranties
);

router.get('/warranty/check/:serial',
    authorize('Crear Ticket', 'permissions_read'),
    warrantyController.checkWarrantyBySerial
);

router.post('/warranty',
    authorize('Garantias', 'permissions_write'),
    warrantyController.createWarranty
);

router.post('/warranty/bulk-upload',
    authorize('Garantias', 'permissions_write'),
    upload.single('file'),
    warrantyController.bulkUploadWarranties
);

// Política — debe estar antes de /warranty/:id para que "policy" no sea capturado como id
router.get('/warranty/policy',
    authorize('Garantias', 'permissions_read'),
    warrantyController.getPolicy
);

router.put('/warranty/policy',
    authorize('Garantias', 'permissions_edit'),
    warrantyController.updatePolicy
);

// ── Rutas con parámetro :id (van al final) ────────────────────────────────────

router.put('/warranty/:id',
    authorize('Garantias', 'permissions_edit'),
    warrantyController.updateWarranty
);

router.patch('/warranty/:id/toggle',
    authorize('Garantias', 'permissions_edit'),
    warrantyController.toggleWarrantyStatus
);

module.exports = router;