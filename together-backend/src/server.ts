import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { rateLimit } from 'express-rate-limit';
import connectDB from './config/db';
import { initSocket } from './socket/socketHandler';
import authRoutes from './routes/authRoutes';
import conversationRoutes from './routes/conversationRoutes';
import messageRoutes from './routes/messageRoutes';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/messages', messageRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Together API is running',
    timestamp: new Date().toISOString(),
  });
});

initSocket(io);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Socket.IO ready');
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  });
}

export default app;
