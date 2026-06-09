import { Response } from 'express';
import * as messageService from '../services/messageService';
import { AuthRequest } from '../types';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const result = await messageService.fetchMessages(conversationId as string, req.userId!, page);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const message = await messageService.createMessage({
      ...req.body,
      senderId: req.userId!,
    });
    res.status(201).json({ success: true, message });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await messageService.removeMessage(
      req.params.messageId as string,
      req.userId!,
      req.body.deleteForEveryone
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
