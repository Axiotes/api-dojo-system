import { Test, TestingModule } from '@nestjs/testing';

import { AthletesController } from './athletes.controller';

describe('AthletesController', () => {
  let controller: AthletesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AthletesController],
    }).compile();

    controller = module.get<AthletesController>(AthletesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
