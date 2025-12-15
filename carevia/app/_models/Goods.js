import mongoose from 'mongoose';

const goodsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      lowercase: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    Type: {
      type: String,
      required: true,
      trim: true,
    },

    // Store the full combined address
    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Separate fields for Google Maps autocomplete
    area: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    village: {
      type: String,
      required: true,
      trim: true,
    },
    deleted:{
      type:Boolean,
      required:false,
      default:false
    },
     status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved' // old posts stay visible
    }
  },
  { timestamps: true }
);

const Goods = mongoose.models.Goods || mongoose.model("Goods", goodsSchema);

export default Goods;
