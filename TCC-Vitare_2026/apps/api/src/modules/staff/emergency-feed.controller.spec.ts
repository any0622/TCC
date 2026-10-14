import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyFeedController } from './emergency-feed.controller';

describe('EmergencyFeedController', () => {
  let controller: EmergencyFeedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmergencyFeedController],
    }).compile();

    controller = module.get<EmergencyFeedController>(EmergencyFeedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
