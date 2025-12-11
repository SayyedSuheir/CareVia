import mongoose from 'mongoose';

const requesteditemsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    goodsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goods",
      required: true,
    },
    requestedAt: { 
      type: Date, 
      default: Date.now 
    },
    expiresAt: { 
      type: Date, 
      required: true 
    },
    status: { 
      type: String, 
      default: "pending",
      enum: ["pending", "completed", "expired"]
    },
  },
  { timestamps: true }
);

// Add index for automatic cleanup of expired documents
requesteditemsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ✅ FIXED: Changed model name from "Goods" to "requesteditems"
const RequestedItem = mongoose.models.requesteditems || mongoose.model("requesteditems", requesteditemsSchema);

export default RequestedItem;