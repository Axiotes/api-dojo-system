import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { Modalities } from './schemas/modalities.schema';
import { ModalitiesService } from './modalities.service';

import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';

describe('ModalitiesService', () => {
  let service: ModalitiesService;
  let model: Model<ModalitiesDocument>;

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
        ModalitiesService,
        {
          provide: getModelToken(Modalities.name),
          useValue: mockModalitiesModel,
        },
      ],
    }).compile();

    service = module.get<ModalitiesService>(ModalitiesService);
    model = module.get<Model<ModalitiesDocument>>(
      getModelToken(Modalities.name),
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a modality succesfully', async () => {
    const modality = {
      name: 'Test',
      description: 'Unit tests with Jest',
      image: Buffer.from('fake-image'),
    } as ModalitiesDocument;

    mockModalitiesModel.findOne.mockReturnThis();
    mockModalitiesModel.exec.mockReturnValueOnce(null);
    mockModalitiesModel.create.mockReturnValueOnce(modality);

    const result = await service.createModality(modality);

    expect(result).toEqual(modality);
    expect(model.findOne).toHaveBeenCalledWith({
      name: modality.name,
    });
  });

  it('should throw a ConflictException if modality name already exist', async () => {
    const modality = {
      name: 'Test',
      description: 'Unit tests with Jest',
      image: Buffer.from('fake-image'),
    } as ModalitiesDocument;

    mockModalitiesModel.findOne.mockReturnThis();
    mockModalitiesModel.exec.mockReturnValueOnce(modality);

    await expect(service.createModality(modality)).rejects.toThrow(
      new ConflictException(
        `Modality with name ${modality.name} already exists.`,
      ),
    );
    expect(model.findOne).toHaveBeenCalledWith({
      name: modality.name,
    });
    expect(model.create).toHaveBeenCalledTimes(0);
  });

  it('should find a modality by ID succesfully', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';
    const modality: Partial<ModalitiesDocument> = {
      id,
      name: 'Test',
      description: 'Unit tests with jest',
      image: Buffer.from('fake-image'),
    };

    mockModalitiesModel.findById.mockReturnThis();
    mockModalitiesModel.exec.mockResolvedValue(modality);

    const result = await service.findById(id);

    expect(result).toEqual(modality);
    expect(model.findById).toHaveBeenCalledWith(id);
  });

  it('should throw a NotFoundException if modality is not found', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';

    mockModalitiesModel.findById.mockReturnThis();
    mockModalitiesModel.exec.mockResolvedValue(null);

    await expect(service.findById(id)).rejects.toThrow(
      new NotFoundException('Modality not found'),
    );
    expect(model.findById).toHaveBeenCalledWith(id);
  });

  it('should find all admins with pagination', async () => {
    const queryParams = { skip: 0, limit: 5, status: true };
    const admins: Partial<ModalitiesDocument>[] = [
      {
        _id: '1',
        name: 'Test 1',
        description: 'Unit tests 1',
        image: Buffer.from('fake-image'),
      },
      {
        _id: '2',
        name: 'Test 2',
        description: 'Unit tests 2',
        image: Buffer.from('fake-image'),
      },
      {
        _id: '3',
        name: 'Test 3',
        description: 'Unit tests 3',
        image: Buffer.from('fake-image'),
      },
      {
        _id: '4',
        name: 'Test 4',
        description: 'Unit tests 4',
        image: Buffer.from('fake-image'),
      },
      {
        _id: '5',
        name: 'Test 5',
        description: 'Unit tests 5',
        image: Buffer.from('fake-image'),
      },
    ];

    mockModalitiesModel.find.mockReturnThis();
    mockModalitiesModel.skip.mockReturnThis();
    mockModalitiesModel.limit.mockReturnThis();
    mockModalitiesModel.exec.mockResolvedValue(admins);

    const result = await service.findAll(queryParams);

    expect(result).toEqual(admins);
    expect(result.length).toBe(admins.length);
    expect(model.find).toHaveBeenCalled();
    expect(mockModalitiesModel.skip).toHaveBeenCalledWith(queryParams.skip);
    expect(mockModalitiesModel.limit).toHaveBeenCalledWith(queryParams.limit);
  });
});
