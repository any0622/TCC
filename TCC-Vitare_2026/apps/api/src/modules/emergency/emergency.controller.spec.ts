import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';

describe('EmergencyController', () => {
  let controller: EmergencyController;

  const mockEmergencyService = {
    trigger: jest.fn(),
    findAllByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmergencyController],
      providers: [
        { provide: EmergencyService, useValue: mockEmergencyService },
      ],
    }).compile();

    controller = module.get<EmergencyController>(EmergencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
