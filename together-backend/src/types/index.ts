import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  fcmToken?: string;
  refreshTokens: string[];
  comparePassword(password: string): Promise<boolean>;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content?: string;
  mediaUrl?: string;
  replyTo?: Types.ObjectId;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  readBy: Types.ObjectId[];
  deletedFor: Types.ObjectId[];
  deletedForEveryone: boolean;
  createdAt: Date;
}

export interface IConversation extends Document {
  _id: Types.ObjectId;
  type: 'direct' | 'group';
  participants: Types.ObjectId[];
  groupName?: string;
  groupAvatarUrl?: string;
  admins: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}
