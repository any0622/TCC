import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenMedicationsController } from './forbidden-medications.controller';

describe('ForbiddenMedicationsController', () => {
  let controller: ForbiddenMedicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForbiddenMedicationsController],
    }).compile();

    controller = module.get<ForbiddenMedicationsController>(
      ForbiddenMedicationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
