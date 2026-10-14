import { Test, TestingModule } from '@nestjs/testing';
import { MedicationsDictionaryController } from './medications-dictionary.controller';

describe('MedicationsDictionaryController', () => {
  let controller: MedicationsDictionaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicationsDictionaryController],
    }).compile();

    controller = module.get<MedicationsDictionaryController>(
      MedicationsDictionaryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
