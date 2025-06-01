import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export function connectToDatabase() {
  const dbURI = process.env.MONGO_URI;

  if (!dbURI) {
    console.error("MongoDB URI not found in environment variables.");
    process.exit(1); // stop the app if DB URI is missing
  }

  mongoose
    .connect(dbURI)
    .then(() => {
      console.log("✅ Connected to MongoDB");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1); // optional: exit the app on failure
    });
}
