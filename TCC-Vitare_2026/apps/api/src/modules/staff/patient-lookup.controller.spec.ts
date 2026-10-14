import { Test, TestingModule } from '@nestjs/testing';
import { PatientLookupController } from './patient-lookup.controller';

describe('PatientLookupController', () => {
  let controller: PatientLookupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientLookupController],
    }).compile();

    controller = module.get<PatientLookupController>(PatientLookupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
