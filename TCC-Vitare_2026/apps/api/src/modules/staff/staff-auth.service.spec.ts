import { Test, TestingModule } from '@nestjs/testing';
import { StaffAuthService } from './staff-auth.service';

describe('StaffAuthService', () => {
  let service: StaffAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffAuthService],
    }).compile();

    service = module.get<StaffAuthService>(StaffAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
