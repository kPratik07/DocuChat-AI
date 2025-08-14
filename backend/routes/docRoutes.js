import express from "express";
import {
  createDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
} from "../controllers/docController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createDocument);
router.get("/", protect, getDocuments);
router.put("/:id", protect, updateDocument);
router.delete("/:id", protect, deleteDocument);

export default router;
