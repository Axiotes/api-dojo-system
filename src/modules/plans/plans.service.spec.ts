import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { PlansService } from './plans.service';
import { Plans } from './schemas/plans.schema';
import { PlanDto } from './dtos/plan.dto';
import { FindPlansDto } from './dtos/find-plans.dto';

import { PlanDocument } from '@ds-types/documents/plan-document';
import { Period } from '@ds-enums/period.enum';
import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';

describe('PlansService', () => {
  let service: PlansService;
  let validateFieldsService: ValidateFieldsService;
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
          provide: ValidateFieldsService,
          useValue: {
            isActive: jest.fn(),
          },
        },
        {
          provide: getModelToken(Plans.name),
          useValue: mockPlansModel,
        },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
    validateFieldsService = module.get<ValidateFieldsService>(
      ValidateFieldsService,
    );
    model = module.get<Model<PlanDocument>>(getModelToken(Plans.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a plan successfully', async () => {
    const dto: PlanDto = {
      period: Period.MONTHLY,
      periodQuantity: 3,
      value: 150,
      modality: new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
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

    validateFieldsService.isActive = jest.fn().mockImplementation(() => {});
    mockPlansModel.create.mockResolvedValue(dto);
    mockPlansModel.findById.mockReturnThis();
    mockPlansModel.exec.mockResolvedValue(plan);

    const result = await service.createPlan(dto);

    expect(result).toEqual(plan);
    expect(model.create).toHaveBeenCalledWith(dto);
    expect(validateFieldsService.isActive).toHaveBeenCalledWith(
      'Modalities',
      dto.modality,
    );
  });

  it('should throw BadRequestException if modality is disabled when creating plan', async () => {
    const dto: PlanDto = {
      period: Period.MONTHLY,
      periodQuantity: 3,
      value: 150,
      modality: new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
    };
    const modality = {
      _id: dto.modality,
      name: 'Test',
      description: 'Unit tests with jest',
      status: false,
      __v: 0,
    };

    (validateFieldsService.isActive as jest.Mock).mockRejectedValue(
      new BadRequestException(`Modalities with id ${modality._id} is disabled`),
    );
    await expect(service.createPlan(dto)).rejects.toThrow(
      new BadRequestException(`Modalities with id ${dto.modality} is disabled`),
    );
    expect(validateFieldsService.isActive).toHaveBeenCalledWith(
      'Modalities',
      dto.modality,
    );
    expect(model.create).toHaveBeenCalledTimes(0);
    expect(model.findById).toHaveBeenCalledTimes(0);
  });

  it('should find a plan by id successfully', async () => {
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

  it('should find plans by modality', async () => {
    const modalityId = new Types.ObjectId('60c72b2f9b1d8c001c8e4e2b');
    const fields = [];
    const projection = Object.fromEntries(fields.map((key) => [key, 1]));

    const plans = [
      {
        _id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
        period: Period.MONTHLY,
        periodQuantity: 1,
        value: 50,
        modality: modalityId,
      },
    ];

    mockPlansModel.find.mockReturnThis();
    mockPlansModel.exec.mockResolvedValue(plans);

    const result = await service.findByModality(modalityId, fields);

    expect(result).toEqual(plans);
    expect(model.find).toHaveBeenCalledWith(
      { modality: modalityId, status: true },
      projection,
    );
  });
});
