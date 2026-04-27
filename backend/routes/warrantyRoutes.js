const express = require('express');
const router = express.Router();
const warrantyController = require('../Controllers/warrantyController');
const upload = require('../Middleware/upload');
const authorize = require('../Middleware/authorize');

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

router.get('/warranty/policy',
    authorize('Garantias', 'permissions_read'),
    warrantyController.getPolicy
);

router.put('/warranty/policy',
    authorize('Garantias', 'permissions_edit'),
    warrantyController.updatePolicy
);

router.put('/warranty/:id',
    authorize('Garantias', 'permissions_edit'),
    warrantyController.updateWarranty
);

router.patch('/warranty/:id/toggle',
    authorize('Garantias', 'permissions_edit'),
    warrantyController.toggleWarrantyStatus
);

module.exports = router;