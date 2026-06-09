
import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ success: true, user: req.user });
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await authService.searchUsers(req.query.q as string, req.userId!);
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};