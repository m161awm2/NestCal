import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import mysql from 'mysql2/promise';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { loadEnvFile } from './env';

const DEFAULT_DB_NAME = 'nestcal';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        loadEnvFile();

        const host = process.env.DB_HOST;
        const user = process.env.DB_USER ?? 'root';
        const password = process.env.DB_PASSWORD;
        const database = process.env.DB_NAME ?? DEFAULT_DB_NAME;

        if (!host) {
          throw new Error('DB_HOST environment variable is required');
        }

        if (!password) {
          throw new Error('DB_PASSWORD environment variable is required');
        }

        const tempDb = await mysql.createConnection({
          host,
          port: 3306,
          user,
          password,
        });
        await tempDb.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        await tempDb.end();

        return {
          type: 'mysql',
          host,
          port: 3306,
          username: user,
          password,
          database,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
