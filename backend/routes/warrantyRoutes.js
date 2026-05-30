// ============================================
// RUTAS: GARANTÍAS
// Gestiona el registro de garantías de equipos
// y la política de garantía que los clientes
// aceptan en la app. Incluye carga masiva desde
// archivo para importar garantías en lote.
// La ruta /warranty/check/:serial está bajo el
// módulo 'Crear Ticket' porque se usa al crear
// un ticket para verificar si el equipo tiene
// garantía vigente.
//
// GET   /warranty                  → getAllWarranties      (Garantias - read)
// GET   /warranty/check/:serial    → checkWarrantyBySerial (Crear Ticket - read)
// POST  /warranty                  → createWarranty        (Garantias - write)
// POST  /warranty/bulk-upload      → bulkUploadWarranties  (Garantias - write) + upload
// GET   /warranty/policy           → getPolicy             (Garantias - read)
// PUT   /warranty/policy           → updatePolicy          (Garantias - edit)
// PUT   /warranty/:id              → updateWarranty        (Garantias - edit)
// PATCH /warranty/:id/toggle       → toggleWarrantyStatus  (Garantias - edit)
// ============================================

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