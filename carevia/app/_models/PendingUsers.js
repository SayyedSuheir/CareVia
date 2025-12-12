// models/PendingUsers.js
import mongoose from 'mongoose';

const pendingUsersSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 2, 
      lowercase: true 
    },
    
    phoneNumber: { 
      type: String, 
      required: true,
      trim: true, 
      match: [/^\d+$/, 'Invalid phone number']
    },
    
    email: { 
      type: String, 
      required: true, 
      lowercase: true, 
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'] 
    },
    
    password: { 
      type: String, 
      required: true, 
      trim: true
    },
    
    terms: { 
      type: Boolean, 
      required: true, 
      default: false 
    },

    verificationToken: {
      type: String,
      required: true
    },

    verificationExpires: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
  },
  { 
    timestamps: true,
    // Automatically delete unverified users after 24 hours
    expires: 86400 // 24 hours in seconds
  }
);

// Index for faster lookups
pendingUsersSchema.index({ email: 1 });
pendingUsersSchema.index({ verificationToken: 1 });
pendingUsersSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // TTL index

const PendingUsers = mongoose.models.PendingUsers || mongoose.model('PendingUsers', pendingUsersSchema);

export default PendingUsers;