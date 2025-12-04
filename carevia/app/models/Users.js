import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema(
  {
    
    name: { type: String, required: true, trim: true, minlength: 2, lowercase: true },
    
    phone:{type: String, required: true,trim:true, match :['/^\d+$/','Invalid phone number'] },
    
    email: { type: String, required: true, unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    
    password: { type: String, required: true, trim: true, minlength: 8 },
  },
  { timestamps: true }
);

const Users = mongoose.models.Users || mongoose.model('Users', usersSchema);

export default Users;
