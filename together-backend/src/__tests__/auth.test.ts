import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';

describe('authentication API', () => {
  let mongoServer: MongoMemoryServer;
  let token: string;

  const credentials = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('POST /api/v1/auth/register returns 201 with a token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(credentials);

    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe(credentials.email);
    token = response.body.token;
  });

  it('POST /api/v1/auth/register rejects a duplicate email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ...credentials,
        username: 'anotheruser',
      });

    expect(response.status).toBe(400);
  });

  it('POST /api/v1/auth/login accepts correct credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: credentials.email,
        password: credentials.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    token = response.body.token;
  });

  it('POST /api/v1/auth/login rejects a wrong password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: credentials.email,
        password: 'wrong-password',
      });

    expect(response.status).toBe(401);
  });

  it('GET /api/v1/auth/me accepts a valid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(credentials.email);
  });

  it('GET /api/v1/auth/me rejects a missing token', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
  });
});
