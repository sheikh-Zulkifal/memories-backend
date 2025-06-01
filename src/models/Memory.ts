import mongoose, { Document, Schema } from "mongoose";

export interface IMemory extends Document {
  title: string;
  images: string[];
  passwordHash: string;
  viewsCount: number;
}

const memorySchema = new Schema<IMemory>({
  title: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  passwordHash: {
    type: String,
    required: true,
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
});
export default mongoose.model<IMemory>("Memory", memorySchema);
