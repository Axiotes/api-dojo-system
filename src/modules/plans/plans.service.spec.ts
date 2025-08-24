import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';

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

  const mockModalitiesModel = {
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
          useValue: mockModalitiesModel,
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
    mockModalitiesModel.create.mockResolvedValue(dto);
    mockModalitiesModel.findById.mockReturnThis();
    mockModalitiesModel.exec.mockResolvedValue(plan);

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
});
