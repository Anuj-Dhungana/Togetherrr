import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { IMessage } from '../types';

type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

const onlineUsers = new Map<string, Set<string>>();

const isConversationParticipant = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).select('_id');

  return conversation !== null;
};

export const initSocket = (io: Server): void => {

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id).select('username');
      if (!user) return next(new Error('User not found'));

      socket.userId = decoded.id;
      socket.username = user.username;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`✅ Connected: ${socket.username}`);

    const userSockets = onlineUsers.get(userId) ?? new Set<string>();
    const wasOffline = userSockets.size === 0;
    userSockets.add(socket.id);
    onlineUsers.set(userId, userSockets);

    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    socket.join(`user:${userId}`);
    if (wasOffline) {
      socket.broadcast.emit('user:online', { userId });
    }

    // Join room
    socket.on('room:join', async (conversationId: string) => {
      try {
        if (!await isConversationParticipant(conversationId, userId)) {
          socket.emit('room:error', { conversationId, error: 'Unauthorized' });
          return;
        }
        await socket.join(`room:${conversationId}`);
      } catch {
        socket.emit('room:error', { conversationId, error: 'Unable to join room' });
      }
    });

    socket.on('room:leave', (conversationId: string) => {
      socket.leave(`room:${conversationId}`);
    });

    // Send message
    socket.on('message:send', async (data: {
      conversationId: string;
      content: string;
      type?: string;
      mediaUrl?: string;
      replyTo?: string;
    }) => {
      try {
        if (!await isConversationParticipant(data.conversationId, userId)) {
          socket.emit('message:error', { error: 'Unauthorized' });
          return;
        }

        const validType: MessageType =
          (['text', 'image', 'video', 'audio', 'document'] as MessageType[])
            .includes(data.type as MessageType)
            ? (data.type as MessageType)
            : 'text';

        const message = await Message.create({
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content,
          type: validType,
          mediaUrl: data.mediaUrl,
          replyTo: data.replyTo,
          status: 'sent',
        } as unknown as Partial<IMessage>);

        await Conversation.findByIdAndUpdate(data.conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        const populated = await Message.findById(message._id)
          .populate('senderId', 'username avatar');

        io.to(`room:${data.conversationId}`).emit('message:new', populated);
        socket.emit('message:status', { messageId: message._id, status: 'delivered' });

      } catch {
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    // Typing
    socket.on('typing:start', async ({ conversationId }: { conversationId: string }) => {
      try {
        if (!await isConversationParticipant(conversationId, userId)) {
          socket.emit('room:error', { conversationId, error: 'Unauthorized' });
          return;
        }
        socket.to(`room:${conversationId}`).emit('typing:indicator', {
          userId, username: socket.username, isTyping: true,
        });
      } catch {
        socket.emit('room:error', { conversationId, error: 'Unable to send typing status' });
      }
    });

    socket.on('typing:stop', async ({ conversationId }: { conversationId: string }) => {
      try {
        if (!await isConversationParticipant(conversationId, userId)) {
          socket.emit('room:error', { conversationId, error: 'Unauthorized' });
          return;
        }
        socket.to(`room:${conversationId}`).emit('typing:indicator', {
          userId, username: socket.username, isTyping: false,
        });
      } catch {
        socket.emit('room:error', { conversationId, error: 'Unable to send typing status' });
      }
    });

    // Read receipt
    socket.on('message:read', async ({ messageId, conversationId }: {
      messageId: string; conversationId: string;
    }) => {
      try {
        if (!await isConversationParticipant(conversationId, userId)) {
          socket.emit('message:error', { error: 'Unauthorized' });
          return;
        }

        const message = await Message.findOneAndUpdate(
          { _id: messageId, conversationId },
          {
            $addToSet: { readBy: userId },
            status: 'read',
          }
        );
        if (!message) {
          socket.emit('message:error', { error: 'Message not found' });
          return;
        }

        socket.to(`room:${conversationId}`).emit('message:status', {
          messageId, status: 'read', readBy: userId,
        });
      } catch {
        socket.emit('message:error', { error: 'Failed to mark message as read' });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ Disconnected: ${socket.username}`);
      const userSockets = onlineUsers.get(userId);
      userSockets?.delete(socket.id);

      if (!userSockets || userSockets.size === 0) {
        onlineUsers.delete(userId);
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
        socket.broadcast.emit('user:offline', { userId });
      }
    });
  });
};

export const getOnlineUsers = (): Map<string, Set<string>> => onlineUsers;
