import { Test, TestingModule } from '@nestjs/testing';
import { DiseaseDictionaryController } from './disease-dictionary.controller';

describe('DiseaseDictionaryController', () => {
  let controller: DiseaseDictionaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiseaseDictionaryController],
    }).compile();

    controller = module.get<DiseaseDictionaryController>(
      DiseaseDictionaryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
