import mongoose from 'mongoose';

const goodsSchema = new mongoose.Schema(
  {
    
    name: { type: String, required: true, trim: true, minlength: 2, lowercase: true },
    
    description: { type: String, required: true },
    
    Type: { type: String, required: true, trim: true},
    
    address: {type: String, required: true, trim:true}
    },
  { timestamps: true }
);

const Goods = mongoose.models.Users || mongoose.model('Goods', goodsSchema);

export default Goods;
