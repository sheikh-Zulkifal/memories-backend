import express from "express";
import {
  createMemory,
  deleteMemory,
  updateMemory,
} from "../controllers/memoryController";
import { upload } from '../middleware/upload';

const router = express.Router();
router.post("/",upload.array('images', 10), createMemory);
router.put("/:id",upload.array('images', 10), updateMemory);
router.delete("/:id", deleteMemory);

export default router;