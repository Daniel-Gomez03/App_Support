const express = require('express');
const router = express.Router();
const warrantyController = require('../Controllers/warrantyController');
const upload = require('../Middleware/upload');

router.get('/warranty', warrantyController.getAllWarranties);
router.get('/warranty/check/:serial', warrantyController.checkWarranty);


router.post('/warranty', warrantyController.createWarranty);
router.put('/warranty/:id', warrantyController.updateWarranty);
router.delete('/warranty/:id',warrantyController.deleteWarranty);
router.patch('/warranty/:id/toggle', warrantyController.toggleWarrantyStatus);
router.post('/warranty/bulk-upload', upload.single('file'), warrantyController.bulkUploadWarranties);

module.exports = router;