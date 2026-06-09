import mongoose, { Schema } from 'mongoose';
import { IConversation } from '../types';

const conversationSchema = new Schema<IConversation>({
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct',
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  groupName: { type: String, default: null },
  groupAvatarUrl: { type: String, default: null },
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IConversation>('Conversation', conversationSchema);
