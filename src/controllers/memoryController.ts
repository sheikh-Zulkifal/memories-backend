import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Memory from "../models/Memory";
const shortid = require("shortid");
import ShortURL from "../models/ShortURL";
import fs from "fs";
import { imageDeletionQueue } from "../utils/imageDeletionQueue";
export const createMemory = async (req: Request, res: Response) => {
  try {
    const { title, password } = req.body;
    const images = (req.files as Express.Multer.File[]).map(file => file.path);
    const passwordHash = await bcrypt.hash(password, 10);
    const memory = await Memory.create({ title, images, passwordHash });
    const shortCode = shortid.generate();
    await ShortURL.create({ shortCode, memoryId: memory._id });
    res.status(201).json({
      message: "memort Created",
      shortURL: `http://localhost:3000/${shortCode}`,
      memory: {
        _id: memory._id,
        title: memory.title,
        images: memory.images,
        viewCount: memory.viewCount,}
    })
 } catch (err: any) {
  console.error("Error while creating memory:", err);

  res.status(500).json({
    message: "Error while creating memory",
    error: err.message || err,
  });
}

};
// get
export const handleShortURLAccess = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;

    const short = await ShortURL.findOne({ shortCode }).populate("memoryId");
    if (!short || !short.memoryId) {
      return res.status(404).json({ message: "Memory not found" });
    }

    const memory = await Memory.findByIdAndUpdate(
      short.memoryId._id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    res.json(memory);
  } catch (error) {
    res.status(500).json({ message: "Error while Retrieving Memory", error });
  }
};

export const getMemoryByShortId = async (req: Request, res: Response) => {
  try {
    const memory = await Memory.findOne({ shortId: req.params.shortId });
    if (!memory) return res.status(404).json({ message: "Memory not found" });

    memory.viewCount++;
    await memory.save();

    res.json(memory);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllMemories = async (req: Request, res: Response) => {
  try {
    const shortUrls = await ShortURL.find().populate("memoryId").exec();

    if (!shortUrls) {
      return res.status(404).json({ message: "No memories found" });
    }

    const memoriesWithShortCodes = shortUrls.map(({ shortCode, memoryId }) => {
      if (!memoryId) return null; // safety check if populate failed
      return {
        _id: memoryId._id,
        title: memoryId.title,
        images: memoryId.images,
        viewCount: memoryId.viewCount,
        shortCode,
      };
    }).filter(Boolean); // remove nulls if any

    res.status(200).json(memoriesWithShortCodes);
  } catch (error) {
    console.error("Error in getAllMemories:", error);
    res.status(500).json({
      message: "Error fetching memories",
      error: error instanceof Error ? error.message : error,
    });
  }
};



// Update

export const updateMemory = async (req: Request, res: Response) => {
  try {
    
    const { id } = req.params;
    const { title, images, password } = req.body;
    const memory = await Memory.findById(id);
  if (req.files && Array.isArray(req.files)) {
      const newImagePaths = (req.files as Express.Multer.File[]).map(file => file.path);
      memory.images = [...memory.images, ...newImagePaths];
    }

    if (!memory) {
      res.status(404).json({
        message: "Memory not Found",
      });
    }
    const isMached = await bcrypt.compare(password, memory?.passwordHash);
    if (!isMached) {
      res.status(401).json({ message: "Invalid Password" });
    }
    
    if (memory) {
      memory.title = title || memory.title;
      memory.images = images || memory.images;
      await memory.save();

      res.status(200).json({
        message: "Memory updated successfully",
        memory,
      });
    } else {
      res.status(404).json({ message: "Memory not found" });
    }
  } catch (error) {
  console.error("Error in updateMemory:", error); // Log it to terminal
  res.status(500).json({
    message: "Error updating memory",
    error: error instanceof Error ? error.message : error,
  });
}

};

// Delete

export const deleteMemory = async (req: Request, res: Response) => {
  try {
    console.log("🗑️ DELETE called", req.params.id);
    const { id } = req.params;
    const { password } = req.body;

    const memory = await Memory.findById(id);
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!memory.passwordHash) {
      return res.status(500).json({ message: "Memory has no password set" });
    }

    const isMatched = await bcrypt.compare(password, memory.passwordHash);
    if (!isMatched) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Optional: Delete image files from uploads folder
    memory.images.forEach((imagePath) => {
      const fullPath = imagePath.replace(/\\/g, "/");
      if(fs.existsSync(fullPath))
        imageDeletionQueue.add(fullPath);
      
    });

    // Delete memory and its associated short URL
    await Memory.findByIdAndDelete(id);
    await ShortURL.findOneAndDelete({ memoryId: id });

    return res.status(200).json({
      message: "Memory deleted successfully",
      memory,
    });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return res.status(500).json({
      message: "Error deleting memory",
      error: error instanceof Error ? error.message : error,
    });
  }
};

