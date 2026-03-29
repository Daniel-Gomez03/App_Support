const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no permitido. Solo JPG, PNG y WEBP.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const resizeImage = async (req, res, next) => {
    if (!req.file) return next();

    const userId = req.params.id || 'new';
    const filename = `profile-${userId}-${Date.now()}.webp`;
    const outputPath = path.join(__dirname, '../uploads/profiles', filename);

    try {
        await sharp(req.file.buffer)
            .resize(500, 500, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 80 })
            .toFile(outputPath);

        req.file.path = outputPath;
        req.file.filename = filename;

        next();
    } catch (error) {
        console.error("Error al procesar imagen:", error);
        next(error);
    }
};

module.exports = { upload, resizeImage };