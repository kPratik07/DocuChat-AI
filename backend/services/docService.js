import Document from "../models/docModel.js";

export const createDoc = async ({ title, owner }) => {
  if (!title || !owner) {
    throw new Error("Title and owner are required");
  }
  return await Document.create({ title, owner });
};

export const getDocs = async (owner) => {
  if (!owner) {
    throw new Error("Owner ID is required");
  }
  return await Document.find({ owner }).sort({ updatedAt: -1 });
};

export const updateDoc = async (id, data) => {
  if (!id) {
    throw new Error("Document ID is required");
  }

  const doc = await Document.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    throw new Error("Document not found");
  }

  return doc;
};

export const deleteDoc = async (id) => {
  if (!id) {
    throw new Error("Document ID is required");
  }

  const doc = await Document.findByIdAndDelete(id);

  if (!doc) {
    throw new Error("Document not found");
  }

  return doc;
};
