import mongoose from "mongoose";

const docSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Document", docSchema);
