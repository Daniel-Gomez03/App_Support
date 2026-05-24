// ============================================
// MIDDLEWARE DE CARGA DE EVIDENCIAS DE TICKET
// Pipeline para adjuntar archivos a los
// comentarios de tickets. Admite imágenes
// (JPG, PNG) y archivos no-imagen (PDF, MP4).
//
//   upload         — multer en memoria, valida
//     tipo MIME y limita el tamaño a 15 MB.
//   processEvidence — convierte imágenes a WebP
//     (máx. 1200×1200, sin ampliar) y escribe
//     PDFs y MP4s tal cual en uploads/evidences/.
//
// La carpeta se crea automáticamente si no
// existe para no requerir configuración previa
// del entorno de despliegue.
// ============================================

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];

// ============================================
// UPLOAD (multer)
// Almacena el archivo en buffer de memoria para
// que processEvidence lo lea sin archivo temporal.
// Rechaza tipos fuera de la lista permitida y
// limita el tamaño a 15 MB por archivo.
// ============================================
const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no soportado. Solo se permiten JPG, PNG, PDF y MP4.'), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 15 * 1024 * 1024 },
});

// ============================================
// PROCESS EVIDENCE (sharp / fs)
// Procesa un único archivo del buffer multer.
// Imágenes: sharp las convierte a WebP con un
//   máximo de 1200×1200 sin ampliar originales
//   pequeños (withoutEnlargement: true).
// No-imágenes: se escriben directamente con
//   su extensión original (PDF, MP4).
// Devuelve { fileName, filePath, mimetype }
// para que el controlador lo guarde en BD.
// ============================================
const processEvidence = async (file) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const folder = path.join('uploads', 'evidences');

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    try {
        if (file.mimetype.startsWith('image/')) {
            const fileName = `evidence-${uniqueSuffix}.webp`;
            const filePath = path.join(folder, fileName);

            await sharp(file.buffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(filePath);

            return {
                fileName,
                filePath: filePath.replace(/\\/g, '/'),
                mimetype: 'image/webp',
            };
        } else {
            const fileName = `evidence-${uniqueSuffix}${path.extname(file.originalname)}`;
            const filePath = path.join(folder, fileName);

            fs.writeFileSync(filePath, file.buffer);

            return {
                fileName,
                filePath: filePath.replace(/\\/g, '/'),
                mimetype: file.mimetype,
            };
        }
    } catch (error) {
        console.error('Error procesando evidencia:', error);
        throw new Error('Error al procesar el archivo');
    }
};

module.exports = { upload, processEvidence };