import { Test, TestingModule } from '@nestjs/testing';

import { ValidateFieldsService } from './validate-fields.service';

describe('ValidateFieldsService', () => {
  let service: ValidateFieldsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidateFieldsService],
    }).compile();

    service = module.get<ValidateFieldsService>(ValidateFieldsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
