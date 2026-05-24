// ============================================
// MIDDLEWARE DE CARGA MASIVA (XLSX / CSV)
// Usado exclusivamente para la importación
// masiva de garantías. Valida el archivo por
// extensión Y por tipo MIME de forma conjunta
// para evitar archivos renombrados maliciosos.
// Límite: 5 MB, un solo archivo por petición.
// El buffer en memoria se pasa directamente
// a XLSX.read() y Papa.parse() en el controlador
// sin necesidad de escribir archivo temporal.
// ============================================

const multer = require('multer');
const path = require('path');

const ALLOWED_EXTENSIONS = /xlsx|xls|csv/;

const ALLOWED_MIME_TYPES = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
    'application/csv',
];

// ============================================
// FILE FILTER
// Doble validación: extensión del nombre original
// Y tipo MIME del archivo. Ambos deben pasar
// para aceptar el archivo. Esto previene que un
// archivo con extensión válida pero contenido
// diferente (o viceversa) sea procesado.
// ============================================
const fileFilter = (req, file, cb) => {
    const validExt = ALLOWED_EXTENSIONS.test(path.extname(file.originalname).toLowerCase());
    const validMimetype = ALLOWED_MIME_TYPES.includes(file.mimetype);

    if (validExt && validMimetype) {
        cb(null, true);
    } else {
        cb(new Error('Formato no soportado. Solo se permiten archivos Excel (.xlsx, .xls) o CSV.'));
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
    fileFilter,
});

module.exports = upload;