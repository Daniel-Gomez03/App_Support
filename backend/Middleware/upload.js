const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const filetypes = /xlsx|xls|csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    const mimetypes = [
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        'application/vnd.ms-excel',
        'text/plain', 
        'application/csv'
    ];

    const mimetype = mimetypes.includes(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Formato no soportado. Solo se permiten archivos Excel (.xlsx, .xls) o CSV'));
    }
};

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // Limite 5 MB
        files: 1 
    },
    fileFilter: fileFilter
});

module.exports = upload;