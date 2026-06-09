import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { IMessage } from '../types';

type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document';

interface SendMessageInput {
  conversationId: string;
  senderId: string;
  content?: string;
  type?: string;
  mediaUrl?: string;
  replyTo?: string;
}

export const fetchMessages = async (
  conversationId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });
  if (!conversation) throw new Error('Unauthorized');

  const messages = await Message.find({
    conversationId,
    deletedFor: { $ne: userId },
    deletedForEveryone: false,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('senderId', 'username avatar');

  return {
    messages: messages.reverse(),
    page,
    hasMore: messages.length === limit,
  };
};

export const createMessage = async (input: SendMessageInput) => {
  const { conversationId, senderId, content, type, mediaUrl, replyTo } = input;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: senderId,
  });
  if (!conversation) throw new Error('Unauthorized');

  if (!content && !mediaUrl) throw new Error('Content or media is required');

  const validType: MessageType =
    (['text', 'image', 'video', 'audio', 'document'] as MessageType[]).includes(type as MessageType)
      ? (type as MessageType)
      : 'text';

  const message = await Message.create({
    conversationId,
    senderId,
    content,
    type: validType,
    mediaUrl,
    replyTo,
    status: 'sent',
  } as unknown as Partial<IMessage>);

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    updatedAt: new Date(),
  });

  return await Message.findById(message._id).populate('senderId', 'username avatar');
};

export const removeMessage = async (
  messageId: string,
  userId: string,
  deleteForEveryone: boolean
) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error('Message not found');

  const conversation = await Conversation.findOne({
    _id: message.conversationId,
    participants: userId,
  });
  if (!conversation) throw new Error('Unauthorized');

  if (deleteForEveryone && message.senderId.toString() === userId) {
    await Message.findByIdAndUpdate(messageId, { deletedForEveryone: true });
  } else {
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userId },
    });
  }
};
