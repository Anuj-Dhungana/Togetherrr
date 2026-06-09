import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import { IUser } from '../types';

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  token: string;
  user: Partial<IUser>;
}

export const generateToken = (id: string): string => {
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign({ id }, process.env.JWT_SECRET as string, options);
};

export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
  const { username, email, password } = input;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) throw new Error('Username or email already exists');

  const user = await User.create({ username, email, password });
  const token = generateToken(user._id.toString());

  return {
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
  };
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const { email, password } = input;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Invalid credentials');

  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save();

  const token = generateToken(user._id.toString());

  return {
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isOnline: user.isOnline,
    },
  };
};

export const searchUsers = async (query: string, currentUserId: string) => {
  if (!query) throw new Error('Search query is required');
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return await User.find({
    _id: { $ne: currentUserId },
    $or: [
      { username: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
    ],
  })
    .select('username email avatar isOnline lastSeen')
    .limit(20);
};
