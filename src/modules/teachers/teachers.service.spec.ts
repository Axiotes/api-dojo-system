import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

import { TeachersService } from './teachers.service';
import { Teachers } from './schemas/teachers.schema';

import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';
import { TeacherDocument } from '@ds-types/documents/teacher-document.type';

describe('TeachersService', () => {
  let service: TeachersService;
  let validateFieldsService: ValidateFieldsService;

  let model: Model<TeacherDocument>;

  const mockTeacherModel = {
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
        TeachersService,
        {
          provide: ValidateFieldsService,
          useValue: {
            validateCpf: jest.fn(),
            validateEmail: jest.fn(),
            isActive: jest.fn(),
          },
        },
        {
          provide: getModelToken(Teachers.name),
          useValue: mockTeacherModel,
        },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
    validateFieldsService = module.get<ValidateFieldsService>(
      ValidateFieldsService,
    );
    model = module.get<Model<TeacherDocument>>(getModelToken(Teachers.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a teacher succesfully', async () => {
    const newTeacher = {
      name: 'Test',
      cpf: '12345678910',
      email: 'test@gmail.com',
      hourPrice: 5,
      description: 'Unit tests with jest',
      modalities: [
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
        new Types.ObjectId('64f1b2a3c4d5e6f7890abc34'),
      ],
      image: Buffer.from('new-fake-image'),
    } as TeacherDocument;

    const teacher = {
      _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc15'),
      name: 'Test',
      cpf: '12345678910',
      email: 'test@gmail.com',
      hourPrice: 5,
      description: 'Unit tests with jest',
      modalities: [
        {
          name: 'Judô',
          description: 'Modalidade Judô',
        },
        {
          name: 'Jiu-Jitsu',
          description: 'Modalidade Jiu-Jitsu',
        },
      ],
      image: Buffer.from('new-fake-image'),
    };

    validateFieldsService.validateCpf = jest.fn().mockImplementation(() => {});
    validateFieldsService.validateEmail = jest
      .fn()
      .mockImplementation(() => {});

    newTeacher.modalities.forEach(() => {
      validateFieldsService.isActive = jest.fn().mockImplementation(() => {});
    });

    mockTeacherModel.create.mockResolvedValue({
      ...newTeacher,
      _id: teacher._id,
    });
    mockTeacherModel.findById.mockReturnThis();
    mockTeacherModel.exec.mockResolvedValue(teacher);

    const result = await service.createTeacher(newTeacher);

    expect(result).toEqual(teacher);
    expect(validateFieldsService.validateCpf).toHaveBeenCalledWith(
      'Teachers',
      newTeacher.cpf,
    );
    expect(validateFieldsService.validateEmail).toHaveBeenCalledWith(
      'Teachers',
      newTeacher.email,
    );
    newTeacher.modalities.forEach((modalityId) => {
      expect(validateFieldsService.isActive).toHaveBeenCalledWith(
        'Modalities',
        modalityId,
      );
    });
    expect(validateFieldsService.isActive).toHaveBeenCalledTimes(
      newTeacher.modalities.length,
    );
    expect(model.create).toHaveBeenCalledWith(newTeacher);
    expect(model.findById).toHaveBeenCalledWith(teacher._id);
  });
});
