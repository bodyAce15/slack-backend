const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
    {
        originalName: { type: String, required: true },
        storedName: { type: String, required: true },
        mimeType: { type: String, required: true },
        sizeBytes: { type: Number, required: true },
        uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('files', fileSchema);