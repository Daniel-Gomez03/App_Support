const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no soportado. Solo se permiten JPG, PNG, PDF y MP4.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB 
});

const processEvidence = async (file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
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
                mimetype: 'image/webp'
            };
        } else {
            const fileName = `evidence-${uniqueSuffix}${path.extname(file.originalname)}`;
            const filePath = path.join(folder, fileName);

            fs.writeFileSync(filePath, file.buffer);

            return {
                fileName,
                filePath: filePath.replace(/\\/g, '/'),
                mimetype: file.mimetype
            };
        }
    } catch (error) {
        console.error("Error procesando evidencia:", error);
        throw new Error("Error al procesar el archivo");
    }
};

module.exports = { upload, processEvidence };