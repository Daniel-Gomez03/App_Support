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
        cb(new Error('Formato no soportado'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

const processEvidence = async (file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const folder = 'uploads/evidences';

    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    if (file.mimetype.startsWith('image/')) {
        const fileName = `evidence-${uniqueSuffix}.webp`;
        const filePath = path.join(folder, fileName);

        await sharp(file.buffer)
            .webp({ quality: 90, lossless: false })
            .toFile(filePath);

        return { fileName, filePath, mimetype: 'image/webp' };
    } else {
        const fileName = `evidence-${uniqueSuffix}${path.extname(file.originalname)}`;
        const filePath = path.join(folder, fileName);

        fs.writeFileSync(filePath, file.buffer);
        return { fileName, filePath, mimetype: file.mimetype };
    }
};

module.exports = { upload, processEvidence };