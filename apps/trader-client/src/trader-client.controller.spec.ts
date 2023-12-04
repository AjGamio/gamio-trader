import { Test, TestingModule } from '@nestjs/testing';
import { TraderClientController } from './trader-client.controller';
import { TraderClientService } from './trader-client.service';

describe('TraderClientController', () => {
  let traderClientController: TraderClientController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TraderClientController],
      providers: [TraderClientService],
    }).compile();

    traderClientController = app.get<TraderClientController>(TraderClientController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(traderClientController.getHello()).toBe('Hello World!');
    });
  });
});
