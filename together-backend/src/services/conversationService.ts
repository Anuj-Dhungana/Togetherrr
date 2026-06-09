import Conversation from '../models/Conversation';

export const getUserConversations = async (userId: string) => {
  return await Conversation.find({ participants: userId })
    .populate('participants', 'username avatar isOnline lastSeen')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
};

export const findOrCreateDirect = async (userId: string, otherUserId: string) => {
  let conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [userId, otherUserId], $size: 2 },
  }).populate('participants', 'username avatar isOnline lastSeen');

  if (!conversation) {
    const created = await Conversation.create({
      type: 'direct',
      participants: [userId, otherUserId],
      createdBy: userId,
    });
    conversation = await Conversation.findById(created._id)
      .populate('participants', 'username avatar isOnline lastSeen');
  }

  return conversation;
};

export const createGroup = async (
  userId: string,
  groupName: string,
  participants: string[]
) => {
  if (!groupName || participants.length < 2) {
    throw new Error('Group name and at least 2 participants required');
  }

  const allParticipants = [...new Set([userId, ...participants])];

  const conversation = await Conversation.create({
    type: 'group',
    groupName,
    participants: allParticipants,
    admins: [userId],
    createdBy: userId,
  });

  return await Conversation.findById(conversation._id)
    .populate('participants', 'username avatar isOnline lastSeen');
};
