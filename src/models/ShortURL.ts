import mongoose, { Document, Schema } from "mongoose";

export interface IShortURL extends Document {
  shortCode: string;
  memoryId: mongoose.Types.ObjectId;
}

const shortURLSchema = new Schema<IShortURL>(
  {
    shortCode: {
      type: String,
      required: true,
      unique: true,
    },
    memoryId: {
      type: Schema.Types.ObjectId,
      ref: "Memory",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IShortURL>("ShortURL", shortURLSchema);
