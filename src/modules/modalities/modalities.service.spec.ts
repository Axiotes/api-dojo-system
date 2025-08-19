import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';

import { Modalities } from './schemas/modalities.schema';
import { ModalitiesService } from './modalities.service';

import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';

describe('ModalitiesService', () => {
  let service: ModalitiesService;
  let model: Model<ModalitiesDocument>;

  const mockAdminModel = {
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
          useValue: mockAdminModel,
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

    mockAdminModel.findOne.mockReturnThis();
    mockAdminModel.exec.mockReturnValueOnce(null);
    mockAdminModel.create.mockReturnValueOnce(modality);

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

    mockAdminModel.findOne.mockReturnThis();
    mockAdminModel.exec.mockReturnValueOnce(modality);

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
});
