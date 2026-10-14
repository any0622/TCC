import { Test, TestingModule } from '@nestjs/testing';
import { StaffAuthController } from './staff-auth.controller';

describe('StaffAuthController', () => {
  let controller: StaffAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffAuthController],
    }).compile();

    controller = module.get<StaffAuthController>(StaffAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
