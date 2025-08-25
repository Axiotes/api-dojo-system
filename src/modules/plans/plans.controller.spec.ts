import { Test, TestingModule } from '@nestjs/testing';

import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlanDto } from './dtos/plan.dto';

import { Period } from '@ds-enums/period.enum';

describe('PlansController', () => {
  let controller: PlansController;
  let plansService: PlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlansController],
      providers: [
        {
          provide: PlansService,
          useValue: {
            createPlan: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PlansController>(PlansController);
    plansService = module.get<PlansService>(PlansService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a plan sucessfully', async () => {
    const dto: PlanDto = {
      period: Period.MONTHLY,
      periodQuantity: 3,
      value: 150,
      modality: '64f1b2a3c4d5e6f7890abc12',
    };
    const plan = {
      period: Period.MONTHLY,
      periodQuantity: 3,
      value: 150,
      modality: {
        _id: dto.modality,
        name: 'Test',
        description: 'Unit tests with jest',
        status: true,
        __v: 0,
      },
    };

    plansService.createPlan = jest.fn().mockResolvedValue(plan);

    const result = await controller.createPlan(dto);

    expect(result).toEqual({ data: plan });
    expect(plansService.createPlan).toHaveBeenCalledWith(dto);
  });
});
