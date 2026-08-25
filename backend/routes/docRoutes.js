const express = require('express');
const mongoose = require('mongoose');
const Document = require('../models/docModel');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user._id }).sort({ updatedAt: -1 }).select('-textContent');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load your documents.' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, owner: req.user._id });
    if (!document) return res.status(404).json({ error: 'Document not found.' });

    if (document.fileId && mongoose.connection.readyState === 1) {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'pdfs' });
      await bucket.delete(document.fileId);
    }

    await Document.deleteOne({ _id: document._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete this document.' });
  }
});

module.exports = router;
