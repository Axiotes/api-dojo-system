import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { PlansService } from './plans.service';
import { Plans } from './schemas/plans.schema';
import { PlanDto } from './dtos/plan.dto';

import { ModalitiesService } from '@ds-modules/modalities/modalities.service';
import { PlanDocument } from '@ds-types/documents/plan-document';
import { Period } from '@ds-enums/period.enum';

describe('PlansService', () => {
  let service: PlansService;
  let modalitiesService: ModalitiesService;
  let model: Model<PlanDocument>;

  const mockPlansModel = {
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        {
          provide: ModalitiesService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken(Plans.name),
          useValue: mockPlansModel,
        },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
    modalitiesService = module.get<ModalitiesService>(ModalitiesService);
    model = module.get<Model<PlanDocument>>(getModelToken(Plans.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a plan sucessfully', async () => {
    const dto: PlanDto = {
      period: Period.MONTHLY,
      periodQuantity: 3,
      value: 150,
      modality: '64f1b2a3c4d5e6f7890abc12',
    };
    const modality = {
      _id: dto.modality,
      name: 'Test',
      description: 'Unit tests with jest',
      status: true,
      __v: 0,
    };
    const plan = {
      period: Period.MONTHLY,
      periodQuantity: 3,
      value: 150,
      modality,
    };

    modalitiesService.findById = jest.fn().mockResolvedValue(modality);
    mockPlansModel.create.mockResolvedValue(dto);
    mockPlansModel.findById.mockReturnThis();
    mockPlansModel.exec.mockResolvedValue(plan);

    const result = await service.createPlan(dto);

    expect(result).toEqual(plan);
    expect(modalitiesService.findById).toHaveBeenCalledWith(dto.modality);
    expect(model.create).toHaveBeenCalledWith(dto);
  });

  it('should throw BadRequestException if modality is disabled when creating plan', async () => {
    const dto: PlanDto = {
      period: Period.MONTHLY,
      periodQuantity: 3,
      value: 150,
      modality: '64f1b2a3c4d5e6f7890abc12',
    };
    const modality = {
      _id: dto.modality,
      name: 'Test',
      description: 'Unit tests with jest',
      status: false,
      __v: 0,
    };

    modalitiesService.findById = jest.fn().mockResolvedValue(modality);

    await expect(service.createPlan(dto)).rejects.toThrow(
      new BadRequestException(`Modality with id ${dto.modality} is disabled`),
    );
    expect(model.create).toHaveBeenCalledTimes(0);
    expect(model.findById).toHaveBeenCalledTimes(0);
  });

  it('should find a plan by id sucessfully', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';
    const plan = {
      _id: id,
      period: Period.MONTHLY,
      periodQuantity: 3,
      value: 150,
      modality: {
        _id: '60c72b2f9b1d8c001c8e4e2b',
        name: 'Test',
        description: 'Unit tests with jest',
        status: true,
        __v: 0,
      },
    };

    mockPlansModel.findById.mockReturnThis();
    mockPlansModel.exec.mockResolvedValue(plan);

    const result = await service.findById(id);

    expect(result).toEqual(plan);
    expect(model.findById).toHaveBeenCalledWith(id);
  });

  it('should throw a NotFoundException if plan is not found', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';

    mockPlansModel.findById.mockReturnThis();
    mockPlansModel.exec.mockResolvedValue(null);

    await expect(service.findById(id)).rejects.toThrow(
      new NotFoundException(`Plan with id ${id} not found`),
    );
    expect(model.findById).toHaveBeenCalledWith(id);
  });

  it('should find all plans with pagination', async () => {
    const queryParams = { skip: 0, limit: 5, status: true };
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

    mockPlansModel.find.mockReturnThis();
    mockPlansModel.skip.mockReturnThis();
    mockPlansModel.limit.mockReturnThis();
    mockPlansModel.exec.mockResolvedValue(plans);

    const result = await service.findAll(queryParams);

    expect(result).toEqual(plans);
    expect(result.length).toBe(plans.length);
    expect(model.find).toHaveBeenCalled();
    expect(mockPlansModel.skip).toHaveBeenCalledWith(queryParams.skip);
    expect(mockPlansModel.limit).toHaveBeenCalledWith(queryParams.limit);
  });
});
