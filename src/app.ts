import express from "express";
const cors = require("cors");
import { connectToDatabase } from "./utils/configdb";
import memoryRoutes from "./routes/MemoryRoutes";
import { handleShortURLAccess } from "./controllers/memoryController";

const app = express();

app.use(cors());

// Parse URL-encoded bodies and JSON bodies BEFORE routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/memories", memoryRoutes);

// Handle short URL access
app.get("/:shortId", handleShortURLAccess);

connectToDatabase();

app.listen(3000, () => {
  console.log("✅ Server is running on http://localhost:3000");
});
