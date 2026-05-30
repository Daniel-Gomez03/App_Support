// ============================================
// MIDDLEWARE DE CARGA DE FOTO DE PERFIL
// Pipeline de dos pasos para subir y procesar
// la foto de perfil de usuarios del panel:
//   1. upload   — multer en memoria, valida
//      tipo MIME y limita el tamaño a 10 MB.
//   2. resizeImage — sharp recorta la imagen
//      a 500×500 px en formato WebP (calidad 80)
//      y la guarda en uploads/profiles/.
// El buffer en memoria evita escribir archivos
// temporales inválidos antes de la validación.
// ============================================

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ============================================
// UPLOAD (multer)
// Almacena el archivo en memoria para que
// sharp pueda leerlo directamente del buffer
// sin necesidad de escribir un archivo temporal.
// Rechaza cualquier tipo MIME fuera de la lista
// antes de que el controlador procese la petición.
// ============================================
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no permitido. Solo JPG, PNG y WEBP.'), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

// ============================================
// RESIZE IMAGE (sharp)
// Toma req.file.buffer producido por multer,
// recorta al centro en 500×500 px y convierte
// a WebP con calidad 80 para reducir el peso.
// Escribe el resultado en uploads/profiles/ y
// adjunta path y filename a req.file para que
// el controlador los use al guardar en BD.
// ============================================
const resizeImage = async (req, res, next) => {
    if (!req.file) return next();

    const userId = req.params.id || 'new';
    const filename = `profile-${userId}-${Date.now()}.webp`;
    const outputPath = path.join(__dirname, '../uploads/profiles', filename);

    try {
        await sharp(req.file.buffer)
            .resize(500, 500, { fit: 'cover', position: 'center' })
            .webp({ quality: 80 })
            .toFile(outputPath);

        req.file.path = outputPath;
        req.file.filename = filename;

        next();
    } catch (error) {
        console.error('Error al procesar imagen de perfil:', error);
        next(error);
    }
};

module.exports = { upload, resizeImage };