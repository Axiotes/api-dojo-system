import { Test, TestingModule } from '@nestjs/testing';

import { ModalitiesService } from './modalities.service';

describe('ModalitiesService', () => {
  let service: ModalitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModalitiesService],
    }).compile();

    service = module.get<ModalitiesService>(ModalitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
