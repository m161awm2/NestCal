import {
  Controller,
  Get,
  Post,
  Body,
  Session,
  OnModuleInit,
  OnModuleDestroy,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
import { loadEnvFile } from './env';
import type { Response } from 'express';
import { join } from 'path';

loadEnvFile();

interface EventRow extends RowDataPacket {
  id: number;
  month: number;
  day: number;
  nickname: string;
  title: string;
  content: string;
}

interface UserRow extends RowDataPacket {
  id: number;
  nickname: string;
  password: string;
}

const DB_HOST = process.env.DB_HOST ?? '';
const DB_USER = process.env.DB_USER ?? 'root';
const DB_PASSWORD = process.env.DB_PASSWORD ?? '';
const DB_NAME = process.env.DB_NAME ?? 'nestcal';

const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});
async function initDb() {
  const tempDb = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
  });
  await tempDb.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await tempDb.end();

  await db.query(`CREATE TABLE IF NOT EXISTS users(
      id INT AUTO_INCREMENT PRIMARY KEY,
      nickname VARCHAR (20),
      password VARCHAR (255)
    )`);

  await db.query(`CREATE TABLE IF NOT EXISTS events(
      id INT AUTO_INCREMENT PRIMARY KEY,
      month INT,
      day INT,
      nickname TEXT,
      title VARCHAR (100),
      content TEXT
    )`);
}
@Controller()
export class AppController implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly appService: AppService) {}

  async onModuleInit() {
    await initDb();
  }

  async onModuleDestroy() {
    await db.end();
  }

  @Get()
  home(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }

  @Get('api/events')
  async getEvents() {
    const [rows] = await db.query<EventRow[]>(
      'SELECT * FROM events ORDER BY month, day',
    );
    return rows;
  }
  @Post('login')
  async login(
    @Body() body: { nickname: string; password: string },
    @Session() session: Record<string, any>,
  ) {
    const { nickname, password } = body;
    const [rows] = await db.query<UserRow[]>(
      'SELECT * FROM users WHERE nickname = ? AND password = ?',
      [nickname, password],
    );
    if (rows.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }
    session.userId = rows[0].id;
    session.nickname = rows[0].nickname;
    return { message: 'Login successful' };
  }
  @Post('register')
  async register(@Body() body: { nickname: string; password: string }) {
    const { nickname, password } = body;
    await db.query('INSERT INTO users (nickname, password) VALUES (?, ?)', [
      nickname,
      password,
    ]);
    return { message: 'Registration successful' };
  }
  @Post('events')
  async createEvent(
    @Body()
    body: { month: number; day: number; title: string; content: string },
    @Session() session: Record<string, any>,
  ) {
    if (!session.userId) {
      throw new Error('Unauthorized');
    }

    const [users] = await db.query<UserRow[]>(
      'SELECT nickname FROM users WHERE id = ?',
      [session.userId],
    );
    if (users.length === 0) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { month, day, title, content } = body;
    const { nickname } = users[0];
    await db.query(
      'INSERT INTO events (month, day, nickname, title, content) VALUES (?, ?, ?, ?, ?)',
      [month, day, nickname, title, content],
    );
    return { message: 'Event created successfully' };
  }
}
