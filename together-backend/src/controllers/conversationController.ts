import { Response } from 'express';
import * as conversationService from '../services/conversationService';
import { AuthRequest } from '../types';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversations = await conversationService.getUserConversations(req.userId!);
    res.json({ success: true, conversations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDirect = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversation = await conversationService.findOrCreateDirect(req.userId!, req.body.otherUserId);
    res.json({ success: true, conversation });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupName, participants } = req.body;
    const conversation = await conversationService.createGroup(req.userId!, groupName, participants);
    res.status(201).json({ success: true, conversation });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};