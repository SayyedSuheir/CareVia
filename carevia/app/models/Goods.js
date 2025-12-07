import mongoose from 'mongoose';

const goodsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    name: { type: String, required: true, trim: true, minlength: 2, lowercase: true },

    image: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    Type: { type: String, required: true, trim: true },

    address: { type: String, required: true, trim:true }
  },
  { timestamps: true }
);

const Goods = mongoose.models.Goods || mongoose.model("Goods", goodsSchema);

export default Goods;
