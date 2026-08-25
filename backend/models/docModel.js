const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    storedName: { type: String, required: true, unique: true },
    filePath: { type: String },
    fileId: { type: mongoose.Schema.Types.ObjectId },
    fileData: { type: Buffer },
    textContent: { type: String, default: '' },
    numPages: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
