//Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  goodsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goods',
    required: true
  },
  requestedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'requesteditems'
  },
  type: {
    type: String,
    enum: ['item_requested', 'request_expired', 'request_completed'],
    default: 'item_requested'
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);