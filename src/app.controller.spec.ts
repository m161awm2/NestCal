import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import type { Response } from 'express';
import { join } from 'path';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should serve the public index page', () => {
      const sendFile = jest.fn();
      const response = { sendFile } as unknown as Response;

      appController.home(response);

      expect(sendFile).toHaveBeenCalledWith(
        expect.stringContaining(join('public', 'index.html')),
      );
    });
  });
});
