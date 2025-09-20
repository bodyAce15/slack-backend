const express = require('express')
const router = express.Router()

const { upload } = require('../utils/fileUpload');
const fileController = require('../controllers/fileController');

// Accept any file field name, up to 10 files, and surface multer errors cleanly
router.post('/upload', upload.any(), fileController.upload);
router.get('/download/:id', fileController.download);

// Multer/type/limit error handler for this router
router.use((err, req, res, next) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
});

module.exports = router;