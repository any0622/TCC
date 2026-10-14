import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyService } from './emergency.service';
import { EmergencyRepository } from './repositories/emergency.repository';

describe('EmergencyService', () => {
  let service: EmergencyService;

  const mockEmergencyRepository = {
    trigger: jest.fn(),
    findAllByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmergencyService,
        { provide: EmergencyRepository, useValue: mockEmergencyRepository },
      ],
    }).compile();

    service = module.get<EmergencyService>(EmergencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
