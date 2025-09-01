import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlanDto } from './dtos/plan.dto';
import { FindPlansDto } from './dtos/find-plans.dto';

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
            findById: jest.fn(),
            findAll: jest.fn(),
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
      modality: new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
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

  it('should find a plan by ID successfully', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';
    const plan = {
      _id: '60c72b2f9b1d8c001c8e4e1a',
      period: Period.MONTHLY,
      periodQuantity: 1,
      value: 50,
      modality: {
        _id: '60c72b2f9b1d8c001c8e4e2b',
        name: 'Test',
        description: 'Unit tests with jest',
        status: true,
        __v: 0,
      },
    };

    plansService.findById = jest.fn().mockResolvedValue(plan);

    const result = await controller.findById(id);

    expect(result).toEqual({ data: plan });
    expect(plansService.findById).toHaveBeenCalledWith(id);
  });

  it('should throw BadRequestException for invalid ID format in findByID', async () => {
    const invalidId = '1234';

    await expect(controller.findById(invalidId)).rejects.toThrow(
      new BadRequestException('Invalid id format'),
    );
    expect(plansService.findById).toHaveBeenCalledTimes(0);
  });

  it('should find all plans successfully', async () => {
    const queryParams: FindPlansDto = {
      skip: 0,
      limit: 5,
      status: true,
      modality: new Types.ObjectId(),
    };
    const plans = [
      {
        _id: '60c72b2f9b1d8c001c8e4e1a',
        period: Period.MONTHLY,
        periodQuantity: 1,
        value: 50,
        modality: {
          _id: '60c72b2f9b1d8c001c8e4e2b',
          name: 'Test',
          description: 'Unit tests with jest',
          status: true,
          __v: 0,
        },
      },
      {
        _id: '60c72b2f9b1d8c001c8e4d2c',
        period: Period.MONTHLY,
        periodQuantity: 3,
        value: 100,
        modality: {
          _id: '60c72b2f9b1d8c001c8e4e2b',
          name: 'Test',
          description: 'Unit tests with jest',
          status: true,
          __v: 0,
        },
      },
      {
        _id: '60c72b2f9b1d8c001c8e4e4f',
        period: Period.MONTHLY,
        periodQuantity: 6,
        value: 150,
        modality: {
          _id: '60c72b2f9b1d8c001c8e4e2b',
          name: 'Test',
          description: 'Unit tests with jest',
          status: true,
          __v: 0,
        },
      },
    ];

    plansService.findAll = jest.fn().mockResolvedValue(plans);

    const result = await controller.findAll(queryParams);

    expect(result).toEqual({
      data: plans,
      pagination: { skip: queryParams.skip, limit: queryParams.limit },
      total: plans.length,
    });
    expect(result.data.length).toBe(plans.length);
    expect(plansService.findAll).toHaveBeenCalledWith(queryParams);
  });
});
