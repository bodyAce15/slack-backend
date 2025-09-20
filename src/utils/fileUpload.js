const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadDir = path.join('./src/source/files');

// Ensure upload directory exists to prevent ENOENT errors
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (e) {
    // If directory cannot be created, multer will fail; throw to surface early
    throw e;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB per file

const allowedMimes = new Set([
    // images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // docs
    'application/pdf', 'text/plain',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // archives
    'application/zip', 'application/x-zip-compressed', 'application/x-7z-compressed', 'application/x-tar',
    // audio/video (basic)
    'audio/mpeg', 'audio/mp4', 'video/mp4', 'video/quicktime',
]);

const fileFilter = (req, file, cb) => {
    if (allowedMimes.has(file.mimetype)) return cb(null, true);
    return cb(new Error('Unsupported file type'));
};

exports.upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 10 },
    fileFilter,
});