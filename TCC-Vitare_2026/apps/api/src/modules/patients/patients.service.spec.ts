import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './repositories/patients.repository';

describe('PatientsService', () => {
  let service: PatientsService;

  const mockPatientsRepository = {
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: PatientsRepository, useValue: mockPatientsRepository },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
