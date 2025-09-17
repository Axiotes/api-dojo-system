import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { Modalities } from './schemas/modalities.schema';
import { ModalitiesService } from './modalities.service';

import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';
import { PlansService } from '@ds-modules/plans/plans.service';
import { ClassesService } from '@ds-modules/classes/classes.service';
import { TeachersService } from '@ds-modules/teachers/teachers.service';

describe('ModalitiesService', () => {
  let service: ModalitiesService;
  let plansService: PlansService;
  let classesService: ClassesService;
  let teachersService: TeachersService;
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
        {
          provide: PlansService,
          useValue: {
            findByModality: jest.fn(),
          },
        },
        {
          provide: TeachersService,
          useValue: {
            findByModality: jest.fn(),
          },
        },
        {
          provide: ClassesService,
          useValue: {
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ModalitiesService>(ModalitiesService);
    plansService = module.get<PlansService>(PlansService);
    classesService = module.get<ClassesService>(ClassesService);
    teachersService = module.get<TeachersService>(TeachersService);
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
    const id = new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a');
    const modality: Partial<ModalitiesDocument> = {
      id,
      name: 'Test',
      description: 'Unit tests with jest',
      image: Buffer.from('fake-image'),
    };
    const fields = [];
    const projection = Object.fromEntries(fields.map((key) => [key, 1]));

    mockModalitiesModel.findById.mockReturnThis();
    mockModalitiesModel.exec.mockResolvedValue(modality);

    const result = await service.findById(id, []);

    expect(result).toEqual(modality);
    expect(model.findById).toHaveBeenCalledWith(id, projection);
  });

  it('should throw a NotFoundException if modality is not found', async () => {
    const id = new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a');
    const fields = [];
    const projection = Object.fromEntries(fields.map((key) => [key, 1]));

    mockModalitiesModel.findById.mockReturnThis();
    mockModalitiesModel.exec.mockResolvedValue(null);

    await expect(service.findById(id, [])).rejects.toThrow(
      new NotFoundException(`Modality with id ${id} not found`),
    );
    expect(model.findById).toHaveBeenCalledWith(id, projection);
  });

  it('should find all modalities with pagination', async () => {
    const queryParams = { skip: 0, limit: 5, status: true };
    const modalities: Partial<ModalitiesDocument>[] = [
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
    mockModalitiesModel.exec.mockResolvedValue(modalities);

    const result = await service.findAll(queryParams);

    expect(result).toEqual(modalities);
    expect(result.length).toBe(modalities.length);
    expect(model.find).toHaveBeenCalled();
    expect(mockModalitiesModel.skip).toHaveBeenCalledWith(queryParams.skip);
    expect(mockModalitiesModel.limit).toHaveBeenCalledWith(queryParams.limit);
  });

  it('should update a modality successfully', async () => {
    const modality: Partial<ModalitiesDocument> = {
      _id: '60c72b2f9b1d8c001c8e4e1a',
      name: 'Old Name Test',
      description: 'Old description. Unit tests with Jest',
      image: Buffer.from('old-fake-image'),
    };
    const updateModality: Partial<ModalitiesDocument> = {
      _id: modality._id,
      name: 'New Name Test',
      description: 'New description. Unit tests with Jest',
      image: Buffer.from('new-fake-image'),
    };

    service.findById = jest.fn().mockResolvedValue(modality);
    mockModalitiesModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    mockModalitiesModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updateModality),
    });

    const result = await service.update(updateModality);

    expect(result).toEqual(updateModality);
    expect(model.findOne).toHaveBeenCalledWith({ name: updateModality.name });
  });

  it('should throw a ConflicException new name already exists', async () => {
    const modality: Partial<ModalitiesDocument> = {
      _id: '60c72b2f9b1d8c001c8e4e1a',
      name: 'Old Name Test',
      description: 'Old description. Unit tests with Jest',
      image: Buffer.from('old-fake-image'),
    };
    const updateModality: Partial<ModalitiesDocument> = {
      _id: modality._id,
      name: 'Name Test',
      description: 'New description. Unit tests with Jest',
      image: Buffer.from('new-fake-image'),
    };

    service.findById = jest.fn().mockResolvedValue(modality);
    mockModalitiesModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(modality),
    });

    await expect(service.update(updateModality)).rejects.toThrow(
      new ConflictException(
        `Modality with name ${updateModality.name} already exists.`,
      ),
    );
    expect(model.findOne).toHaveBeenCalledWith({ name: updateModality.name });
    expect(model.findByIdAndUpdate).toHaveBeenCalledTimes(0);
  });

  it('should set modality status true', async () => {
    const modality = {
      status: false,
      save: jest.fn(),
    } as unknown as ModalitiesDocument;

    await service.setStatus(modality, true);

    expect(modality.status).toBe(true);
    expect(modality.save).toHaveBeenCalled();
  });

  it('should set modality status false', async () => {
    const modality = {
      status: true,
      save: jest.fn(),
    } as unknown as ModalitiesDocument;

    await service.setStatus(modality, false);

    expect(modality.status).toBe(false);
    expect(modality.save).toHaveBeenCalled();
  });

  it('should deactivate a modality successfully', async () => {
    const modalityId = '60c72b2f9b1d8c001c8e4e1a';
    const modality = {
      id: new Types.ObjectId(modalityId),
      status: true,
    };

    service.findById = jest.fn().mockResolvedValue(modality);
    plansService.findByModality = jest.fn().mockResolvedValue([]);
    teachersService.findByModality = jest.fn().mockResolvedValue([]);
    classesService.findBy = jest.fn().mockResolvedValue([]);
    service.setStatus = jest.fn().mockImplementation(() => {});

    await service.deactivate(modalityId);

    expect(service.findById).toHaveBeenCalledWith(modality.id, [
      'id',
      'status',
    ]);
    expect(plansService.findByModality).toHaveBeenCalledWith(modality.id, [
      'id',
    ]);
    expect(teachersService.findByModality).toHaveBeenCalledWith(modality.id, [
      'id',
    ]);
    expect(classesService.findBy).toHaveBeenCalledWith(
      'modality',
      modality.id,
      ['id'],
    );
    expect(service.setStatus).toHaveBeenCalledWith(modality, false);
  });

  it('should throw ConflictException if modality has associated plans', async () => {
    const modalityId = '60c72b2f9b1d8c001c8e4e1a';
    const modality = {
      id: new Types.ObjectId(modalityId),
      status: true,
    };
    const plans = [
      {
        id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
      },
    ];

    service.findById = jest.fn().mockResolvedValue(modality);
    plansService.findByModality = jest.fn().mockResolvedValue(plans);
    service.setStatus = jest.fn();

    await expect(service.deactivate(modalityId)).rejects.toThrow(
      new ConflictException(
        `Cannot deactivate modality with id ${modalityId} because it has associated plans.`,
      ),
    );
    expect(service.findById).toHaveBeenCalledWith(modality.id, [
      'id',
      'status',
    ]);
    expect(teachersService.findByModality).toHaveBeenCalledTimes(0);
    expect(classesService.findBy).toHaveBeenCalledTimes(0);
    expect(service.setStatus).toHaveBeenCalledTimes(0);
  });

  it('should throw ConflictException if modality has associated teachers', async () => {
    const modalityId = '60c72b2f9b1d8c001c8e4e1a';
    const modality = {
      id: new Types.ObjectId(modalityId),
      status: true,
    };
    const teachers = [
      {
        id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
      },
    ];

    service.findById = jest.fn().mockResolvedValue(modality);
    plansService.findByModality = jest.fn().mockResolvedValue([]);
    teachersService.findByModality = jest.fn().mockResolvedValue(teachers);
    service.setStatus = jest.fn();

    await expect(service.deactivate(modalityId)).rejects.toThrow(
      new ConflictException(
        `Cannot deactivate modality with id ${modalityId} because it has associated teachers.`,
      ),
    );
    expect(service.findById).toHaveBeenCalledWith(modality.id, [
      'id',
      'status',
    ]);
    expect(plansService.findByModality).toHaveBeenCalledWith(modality.id, [
      'id',
    ]);
    expect(classesService.findBy).toHaveBeenCalledTimes(0);
    expect(service.setStatus).toHaveBeenCalledTimes(0);
  });

  it('should throw ConflictException if modality has associated classes', async () => {
    const modalityId = '60c72b2f9b1d8c001c8e4e1a';
    const modality = {
      id: new Types.ObjectId(modalityId),
      status: true,
    };
    const classes = [
      {
        id: new Types.ObjectId('60c72b2f9b1d8c001c8e4e1a'),
      },
    ];

    service.findById = jest.fn().mockResolvedValue(modality);
    plansService.findByModality = jest.fn().mockResolvedValue([]);
    teachersService.findByModality = jest.fn().mockResolvedValue([]);
    classesService.findBy = jest.fn().mockResolvedValue(classes);
    service.setStatus = jest.fn();

    await expect(service.deactivate(modalityId)).rejects.toThrow(
      new ConflictException(
        `Cannot deactivate modality with id ${modalityId} because it has associated classes.`,
      ),
    );
    expect(service.findById).toHaveBeenCalledWith(modality.id, [
      'id',
      'status',
    ]);
    expect(plansService.findByModality).toHaveBeenCalledWith(modality.id, [
      'id',
    ]);
    expect(classesService.findBy).toHaveBeenCalledWith(
      'modality',
      modality.id,
      ['id'],
    );
    expect(service.setStatus).toHaveBeenCalledTimes(0);
  });
});
