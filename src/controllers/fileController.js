const path = require('path');
const fs = require('fs');
const FileModel = require('../models/file');

exports.upload = async (req, res) => {
    try {
        const files = req.files || (req.file ? [req.file] : []);
        if (!files.length) return res.status(400).json({ message: 'No files uploaded' });
        const saved = await Promise.all(files.map(async (f) => {
            const storedName = f.filename || path.basename(f.path || '');
            const doc = await FileModel.create({
                originalName: f.originalname,
                storedName,
                mimeType: f.mimetype,
                sizeBytes: f.size,
                uploader: req.user ? req.user.id : null,
            });
            return doc;
        }));
        
        const filesResponse = saved.map((doc) => {
            const o = doc.toObject();
            return o._id
        });
        return res.json({ files: filesResponse });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Upload failed' });
    }
}

exports.download = async (req, res) => {
    try {
        const id = req.params.id;
        const fileDoc = await FileModel.findById(id);
        if (!fileDoc) return res.status(404).json({ message: 'File not found' });

        const absolutePath = path.join(process.cwd(), 'src', 'source', 'files', fileDoc.storedName);
        if (!fs.existsSync(absolutePath)) return res.status(404).json({ message: 'File missing on server' });

        return res.download(absolutePath, fileDoc.originalName);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Download failed' });
    }
}