import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types';

const messageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document'],
    default: 'text',
  },
  content: { type: String, trim: true },
  mediaUrl: { type: String, default: null },
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read'],
    default: 'sent',
  },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  deletedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  deletedForEveryone: { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', messageSchema);
