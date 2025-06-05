import express from "express";
import {
  createMemory,
  deleteMemory,
  getAllMemories,
  getMemoryByShortId,
  handleShortURLAccess,
  updateMemory,
} from "../controllers/memoryController";
import { upload } from "../middleware/upload";

const router = express.Router();
router.post("/create", upload.array("images", 10), createMemory);
router.put("/update/:id", upload.array("images", 10), updateMemory);
router.get("/:shortId", getMemoryByShortId);
router.get("/", getAllMemories);
router.get("/memory/:shortCode", handleShortURLAccess);

router.delete("/:id", deleteMemory);

export default router;
