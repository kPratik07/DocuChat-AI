import * as docService from "../services/docService.js";

export const createDocument = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Document title is required" });
    }

    const doc = await docService.createDoc({
      title: title.trim(),
      owner: req.user._id,
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const docs = await docService.getDocs(req.user._id);
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching documents" });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const doc = await docService.updateDoc(id, { title, content });
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const result = await docService.deleteDoc(id);
    if (!result) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting document" });
  }
};
